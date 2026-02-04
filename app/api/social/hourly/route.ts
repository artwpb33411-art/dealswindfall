
import { normalizeDeal } from "@/lib/social/normalizeDeal";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { saveFlyerBufferToSupabase } from "@/lib/social/saveFlyerBuffer"; 
import { deleteStorageObject } from "@/lib/social/deleteStorageObject";
import { safeGenerateFlyers } from "@/lib/social/safeGenerateFlyers";
import type { SelectedDeal } from "@/lib/social/types";
import { buildCaption } from "@/lib/social/captionBuilder";
import { postFacebookWithDelayedComment } from "@/lib/social/facebookPostWithDelay";
import { buildPlatformCaptions } from "@/lib/social/captionBuilder";

//import { generateFlyer } from "@/lib/social/flyerGenerator";
//import { generateFlyerSquare } from "@/lib/social/flyers/generateFlyerSquare";
//import { generateFlyerStory } from "@/lib/social/flyers/generateFlyerStory";

import { publishToX } from "@/lib/social/publishers/x";
import { publishToTelegram } from "@/lib/social/publishers/telegram";
//import { publishToFacebook } from "@/lib/social/publishers/facebook";
import { publishToInstagram } from "@/lib/social/publishers/instagram";

import { saveImageToSupabase } from "@/lib/social/saveImage";

export const runtime = "nodejs";


function isInQuietHours(
  hour: number,
  start: number,
  end: number
): boolean {
  if (start === end) return false; // disabled
  if (start < end) {
    return hour >= start && hour < end;
  }
  // wraps midnight (e.g. 22 → 6)
  return hour >= start || hour < end;
}

function normalizeHashtags(
  tags: string[] | string | null | undefined
): string[] {
  if (!tags) return [];

  let list: string[] = [];

  if (Array.isArray(tags)) {
    list = tags;
  } else {
    list = tags.split(",");
  }

  return list
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => (t.startsWith("#") ? t : `#${t}`));
}


export async function POST(req: Request) {
  const CRON_SECRET =
    process.env.CRON_SECRET ?? "9f3e7c29f8a94e4bb9dae34234591e95";

  const isCronCall = req.headers.get("x-cron-secret") === CRON_SECRET;
  const force = !isCronCall; // Manual "Publish Social Now" always forces a run

  const now = new Date();

  try {
    console.log("###############################");
    console.log("### SOCIAL AUTOPOST STARTED ###");
    console.log("### isCron:", isCronCall, "force:", force, "###");
    console.log("###############################");

    // 1️⃣ Load settings / state / platforms
    const [
      { data: settings, error: settingsError },
      { data: state, error: stateError },
      { data: platforms, error: platformsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("auto_publish_settings")
        .select("*")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("auto_publish_state")
        .select("*")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("auto_publish_platforms")
        .select("x, telegram, facebook, instagram, reddit")
        .eq("id", 1)
        .single(),
    ]);

    if (settingsError || stateError || platformsError || !settings || !state) {
      console.error("❌ Missing settings/state/platforms", {
        settingsError,
        stateError,
        platformsError,
      });

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_error",
        deals_published: 0,
        message: "Missing settings/state/platforms",
      });

      return NextResponse.json(
        { error: "Scheduler configuration missing" },
        { status: 500 }
      );
    }

    // 2️⃣ Check if social auto-posting is enabled
    if (!settings.social_enabled) {
      console.log("⛔ Social autopost disabled.");

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: "Social autopost disabled.",
      });

      return NextResponse.json({ skipped: true, reason: "disabled" });
    }

    // 3️⃣ Active platforms
    const activePlatforms = Object.entries(platforms)
      .filter(([, v]) => !!v)
      .map(([k]) => k);

    if (activePlatforms.length === 0) {
      console.log("⛔ No platforms enabled, skipping.");

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: "No social platforms enabled.",
      });

      return NextResponse.json({
        skipped: true,
        reason: "no platforms enabled",
      });
    }

    // 4️⃣ Scheduler timing – only for CRON calls
    const intervalMinutes: number = settings.social_interval_minutes ?? 60;

    const nextRun =
      state.social_next_run != null ? new Date(state.social_next_run) : null;

    if (isCronCall && nextRun && now < nextRun) {
      console.log(
        `⏳ Not time yet. Next social run at: ${nextRun.toISOString()}`
      );

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: `Skipped by scheduler. Now=${now.toISOString()}, nextRun=${nextRun.toISOString()}`,
      });

      return NextResponse.json({ skipped: true, nextRun });
    }
// 4️⃣-A Fetch recent social history for ratio calculation
const ratioWindow =
  settings.social_ratio_window_posts ?? 10;

const { data: recentSocial, error: ratioErr } =
  await supabaseAdmin
    .from("social_post_log")
    .select("is_affiliate, language")
    .eq("post_mode", "auto")
    .order("posted_at", { ascending: false })
    .limit(ratioWindow);

if (ratioErr) {
  throw ratioErr;
}

const affiliateCount =
  recentSocial?.filter(r => r.is_affiliate).length ?? 0;

const nonAffiliateCount =
  recentSocial?.filter(r => !r.is_affiliate).length ?? 0;

const enCount =
  recentSocial?.filter(r => r.language === "en").length ?? 0;

const esCount =
  recentSocial?.filter(r => r.language === "es").length ?? 0;

//4️⃣-B. Determine preference (not enforcement)
  const affRatio =
  settings.social_affiliate_ratio ?? 4;
const nonAffRatio =
  settings.social_non_affiliate_ratio ?? 1;

const enRatio =
  settings.social_en_ratio ?? 3;
const esRatio =
  settings.social_es_ratio ?? 1;

// Prefer the side that is lagging behind its ratio
const preferAffiliate =
  affiliateCount / affRatio <
  nonAffiliateCount / nonAffRatio;

let postLang: "en" | "es" = "en";

if (settings.social_enable_ratios !== false) {
  if (esRatio === 0 && enRatio > 0) {
    postLang = "en";
  } else if (enRatio === 0 && esRatio > 0) {
    postLang = "es";
  } else {
    postLang =
      enCount / enRatio <= esCount / esRatio ? "en" : "es";
  }
}

console.log("🌐 Post language decided:", postLang);


console.log("📊 Ratio preference:", {
  preferAffiliate,
 // preferLanguage,
 postLang,
  affiliateCount,
  nonAffiliateCount,
  enCount,
  esCount,
});

/*
// 4️⃣-C Apply ratio-aware selection with fallback
let candidates = [...available];

// 1️⃣ Affiliate preference
const affiliatePreferred = candidates.filter(
  d => d.is_affiliate === preferAffiliate
);
if (affiliatePreferred.length > 0) {
  candidates = affiliatePreferred;
}

// 2️⃣ Language preference
const languagePreferred = candidates.filter(
  d =>
    (d.language === "es" ? "es" : "en") ===
    preferLanguage
);
if (languagePreferred.length > 0) {
  candidates = languagePreferred;
}

// 3️⃣ Deterministic final pick (oldest-first)
candidates.sort((a: any, b: any) => {
  const ta = new Date(
    a.published_at ?? a.created_at ?? 0
  ).getTime();
  const tb = new Date(
    b.published_at ?? b.created_at ?? 0
  ).getTime();
  return ta - tb;
});

//const raw = candidates[0];

*/


    // 5️⃣ Allowed stores
    const allowedStores: string[] =
      settings.allowed_stores?.length > 0
        ? settings.allowed_stores
        : ["Amazon", "Walmart"];

    console.log("Allowed stores for social:", allowedStores);

// 🌙 Quiet hours check (CRON only)
if (isCronCall) {
  const estHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      hour12: false,
    }).format(now)
  );

  const quietStart = settings.social_quiet_start_hour ?? 1;
  const quietEnd = settings.social_quiet_end_hour ?? 5;

  if (isInQuietHours(estHour, quietStart, quietEnd)) {
    console.log(
      `🌙 Quiet hours active (EST ${quietStart}:00–${quietEnd}:00). Skipping.`
    );

    await supabaseAdmin.from("auto_publish_logs").insert({
      run_time: now.toISOString(),
      action: "social_skip",
      deals_published: 0,
      message: `Quiet hours active. EST hour=${estHour}`,
    });

    return NextResponse.json({
      skipped: true,
      reason: "quiet_hours",
      estHour,
    });
  }
}


 

// 6️⃣ Fetch candidate deals (freshness window based on last social run)
const windowStart =
  state.social_last_run
    ? new Date(state.social_last_run)
    : new Date(
        now.getTime() -
          (settings.social_interval_minutes ?? 60) * 60_000
      );

const since = windowStart.toISOString();

console.log(
  "🪟 Social freshness window since:",
  since,
  "(last run:",
  state.social_last_run,
  ")"
);

console.log(
  "🧪 Deals must be published AFTER:",
  since
);


const baseQuery = supabaseAdmin
  .from("deals")
  .select(`
  id,
  description,
  notes,
  description_es,
  notes_es,
  flyer_text_en,
  flyer_text_es,
  current_price,
  old_price,
  percent_diff,
  image_link,
  product_link,
  review_link,
  store_name,
  slug,
  published_at,
  is_affiliate,
  hash_tags,
  hashtags_es,
  affiliate_short_url
`)

  .eq("status", "Published")
  .eq("exclude_from_auto", false)
  .in("store_name", allowedStores)
  .gte("published_at", since);

let rawDeals: any[] | null = null;

// 1️⃣ Prefer affiliate deals if enabled
if (settings.social_affiliate_only) {
  const { data: affiliateDeals, error } = await baseQuery
    .eq("is_affiliate", true)
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  if (affiliateDeals && affiliateDeals.length > 0) {
    rawDeals = affiliateDeals;
    console.log("💰 Affiliate-only enabled: using affiliate deals");
  } else {
    console.log(
      "ℹ️ Affiliate-only enabled, but no affiliate deals found. Falling back to all deals."
    );
  }
}

// 2️⃣ Fallback to all deals (normal behavior)
if (!rawDeals) {
  const { data: allDeals, error } = await baseQuery
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  rawDeals = allDeals;
}


// If literally no deals, same as before
if (!rawDeals || rawDeals.length === 0) {
  console.log("❌ No deals available for social posting.");

  await supabaseAdmin.from("auto_publish_logs").insert({
    run_time: now.toISOString(),
    action: "social_skip",
    deals_published: 0,
    message: "No eligible deals found.",
  });

  const alignedNow = new Date(
    Math.floor(now.getTime() / 60000) * 60000
  );
  const nextSocialRun = new Date(
    alignedNow.getTime() + intervalMinutes * 60_000
  ).toISOString();

  await supabaseAdmin
    .from("auto_publish_state")
    .update({
      social_last_run: now.toISOString(),
      social_last_count: 0,
      social_last_deal: null,
      social_next_run: nextSocialRun,
      updated_at: now.toISOString(),
    })
    .eq("id", 1);

  return NextResponse.json({ skipped: true, reason: "no deals" });
}

// 6.A️⃣ Exclude deals posted recently (hard dedupe)
const DEDUPE_HOURS = 12;
const dedupeSince = new Date(
  now.getTime() - DEDUPE_HOURS * 60 * 60 * 1000
).toISOString();

const { data: recentPosts, error: recentErr } = await supabaseAdmin
  .from("social_post_log")
  .select("deal_id")
  .gte("posted_at", dedupeSince);

if (recentErr) throw recentErr;

const recentlyPostedIds = new Set(
  (recentPosts ?? []).map((r: any) => r.deal_id)
);

let available = rawDeals
  .filter((d: any) => d.id !== state.social_last_deal)
  .filter((d: any) => !recentlyPostedIds.has(d.id));

if (available.length === 0) {
  console.log("❌ No qualified deals available (all are duplicates/recent).");

  await supabaseAdmin.from("auto_publish_logs").insert({
    run_time: now.toISOString(),
    action: "social_skip",
    deals_published: 0,
    message: "No qualified deals (duplicates/recently posted).",
  });

  const alignedNow = new Date(Math.floor(now.getTime() / 60000) * 60000);
  const nextSocialRun = new Date(
    alignedNow.getTime() + intervalMinutes * 60_000
  ).toISOString();

  await supabaseAdmin
    .from("auto_publish_state")
    .update({
      social_last_run: now.toISOString(),
      social_last_count: 0,
      social_next_run: nextSocialRun,
      updated_at: now.toISOString(),
    })
    .eq("id", 1);

  return NextResponse.json({ skipped: true, reason: "no qualified deals" });
}


  // Discount sanity check
 // .filter((d: any) => (d.percent_diff ?? 0) < 60);
const ratioEnabled = settings.social_enable_ratios ?? true;

let selectedRawDeal: any;

// If ratios are OFF → deterministic oldest-first (available already computed)
if (!ratioEnabled) {
  available.sort((a: any, b: any) => {
    const ta = new Date(a.published_at ?? a.created_at ?? 0).getTime();
    const tb = new Date(b.published_at ?? b.created_at ?? 0).getTime();
    return ta - tb;
  });
  selectedRawDeal = available[0];
} else {
  // 4️⃣-C Apply ratio-aware selection with fallback
let candidates = [...available];

// Affiliate preference
const affiliatePreferred = candidates.filter(
  d => d.is_affiliate === preferAffiliate
);
if (affiliatePreferred.length > 0) {
  candidates = affiliatePreferred;
}
// 2️⃣ Language preference (CRITICAL)
 const languageFiltered = candidates.filter(d =>
  postLang === "es"
    ? !!(d.flyer_text_es || d.description_es || d.notes_es)
    : true
);

if (languageFiltered.length > 0) candidates = languageFiltered;

// Language preference

// Deterministic final pick (oldest-first)
candidates.sort((a: any, b: any) => {
  const ta = new Date(
    a.published_at ?? a.created_at ?? 0
  ).getTime();
  const tb = new Date(
    b.published_at ?? b.created_at ?? 0
  ).getTime();
  return ta - tb;
});

 selectedRawDeal = candidates[0];

}

if (!selectedRawDeal) {
  throw new Error("No deal selected after filtering");
}

const deal = normalizeDeal(selectedRawDeal);

if (postLang === "es" && !deal.description_es) {
  console.warn(
    "⚠️ Spanish selected but deal has no Spanish text. Falling back to EN.",
    deal.id
  );
  postLang = "en";
}


// 6.3 If no qualified deals → DO NOT POST AT ALL (option A for now)
/*
if (available.length === 0) {
  console.log(
    "❌ No qualified deals available (all are duplicates or >= 60% discount)."
  );

  await supabaseAdmin.from("auto_publish_logs").insert({
    run_time: now.toISOString(),
    action: "social_skip",
    deals_published: 0,
    message:
      "No qualified deals (either already posted or discount >= 60%).",
  });

  const alignedNow = new Date(
    Math.floor(now.getTime() / 60000) * 60000
  );
  const nextSocialRun = new Date(
    alignedNow.getTime() + intervalMinutes * 60_000
  ).toISOString();

  await supabaseAdmin
    .from("auto_publish_state")
    .update({
      social_last_run: now.toISOString(),
      social_last_count: 0,
      // keep social_last_deal as-is so we know what was last
      social_next_run: nextSocialRun,
      updated_at: now.toISOString(),
    })
    .eq("id", 1);

  return NextResponse.json({
    skipped: true,
    reason: "no qualified deals",
  });
}
*/
// 6.4 Pick one randomly from remaining pool
//const raw = available[Math.floor(Math.random() * available.length)];


    // 7️⃣ Pick a raw DB row and map → SelectedDeal
  // 6.4 Pick ONE deterministically (oldest-first)
// This prevents starvation and makes behavior predictable.
const raw = selectedRawDeal;


if (!raw) {
  throw new Error("No deal selected after filtering");
}

//const deal = normalizeDeal(raw);

    const logTitle =
      deal.title || deal.description || deal.slug || `Deal #${deal.id}`;

    console.log(
      "🎯 Selected deal:",
      logTitle,
      "| Discount:",
      deal.percent_diff
    );

    // 8️⃣ Prepare image
   let finalImage: string | null = deal.image_link ?? null;


    if (finalImage) {
      try {
        finalImage = await saveImageToSupabase(finalImage);
      } catch (err) {
        console.error("⚠ Error storing image. Using original URL.", err);
      }
    }

    if (!finalImage) {
      finalImage = "https://www.dealswindfall.com/dealswindfall-logoA.png";
    }

    // 9️⃣ Generate flyers
    console.log("🖨 Generating flyers...");




// 9️⃣ Generate flyers — ensure JPEG output
console.log("🖨 Generating flyers...");

const { portrait, square, story } =
await safeGenerateFlyers(deal, postLang);


const portraitBuffer = portrait;
const squareBuffer = square;
const storyBuffer = story;


const portraitBase64 = portrait.toString("base64");
const squareBase64 = square.toString("base64");
const storyBase64 = story.toString("base64");



    // 🔟 Build captions (long + short + URL)

//const aiHashtags = normalizeHashtags(raw.hash_tags);
const aiHashtags = normalizeHashtags(
  postLang === "es" ? raw.hashtags_es : raw.hash_tags
);

// Always include brand hashtag
const finalHashtags = Array.from(
  new Set([
    "#dealswindfall",
    ...aiHashtags,
  ])
);


  const social = await buildCaption(deal, finalHashtags, postLang);




    // 🔟 Post to platforms
    const results: Record<string, any> = {};
    const platformsPosted: string[] = [];

   async function tryPost(
  platform: string,
  fn: () => Promise<any>
) {
  try {
    const res = await fn();
    console.log(`✅ Posted to ${platform}`);
    results[platform] = res;
    platformsPosted.push(platform);

  await supabaseAdmin.from("social_post_log").insert({
  deal_id: deal.id,
  platform,
  status: "success",
  is_affiliate: !!deal.is_affiliate,
  language: postLang,
  post_mode: force ? "manual" : "auto",
});


    return res;
  } catch (err) {
    console.error(`❌ ${platform.toUpperCase()} ERROR:`, err);
    results[platform] = { error: String(err) };

   await supabaseAdmin.from("social_post_log").insert({
  deal_id: deal.id,
  platform,
  status: "failed",
  error: String(err),
  is_affiliate: !!deal.is_affiliate,
  language: postLang,
  post_mode: force ? "manual" : "auto",
});

    throw err;
  }
}
const safeTryPost = (platform: string, fn: () => Promise<any>) =>
  tryPost(platform, fn).catch(() => null);

// 🔟.5️⃣ Publish to enabled platforms
if (platforms.x) {
  await safeTryPost("x", () =>
    publishToX(social.short, square)
  );
}

if (platforms.telegram) {
  await safeTryPost("telegram", () =>
    publishToTelegram(social.text, square)
  );
}

if (platforms.facebook) {
  await safeTryPost("facebook", async () => {
    const { captions, url } = await buildPlatformCaptions(
      deal,
      finalHashtags,
      postLang
    );

    return postFacebookWithDelayedComment({
      pageId: process.env.FACEBOOK_PAGE_ID!,
      pageAccessToken: process.env.FACEBOOK_PAGE_TOKEN!,
      caption: captions.facebook.text,
      flyerImage: portrait,
      isAffiliate: !!deal.is_affiliate,
      lang: postLang,
      dealUrl: url,
    });
  });
}

if (platforms.instagram) {
  await safeTryPost("instagram", async () => {
    const stored = await saveFlyerBufferToSupabase(portraitBuffer, "jpg");

    const res = await publishToInstagram(
      social.text,
      stored.publicUrl
    );

    await deleteStorageObject(stored.bucket, stored.path);
    return res;
  });
}


    // 1️⃣1️⃣ Update scheduler state (CRON and manual both)
    const nextSocialRun = new Date(
      now.getTime() + intervalMinutes * 60_000
    ).toISOString();

    await supabaseAdmin
      .from("auto_publish_state")
      .update({
        social_last_run: now.toISOString(),
        social_last_count: platformsPosted.length > 0 ? 1 : 0,
        social_last_deal: deal.id,
        social_next_run: nextSocialRun,
        updated_at: now.toISOString(),
      })
      .eq("id", 1);

    // 1️⃣2️⃣ Log entry
    await supabaseAdmin.from("auto_publish_logs").insert({
      run_time: now.toISOString(),
      action: "social",
      deals_published: platformsPosted.length > 0 ? 1 : 0,
      message:
        platformsPosted.length > 0
          ? `Posted deal ID ${deal.id} to: ${platformsPosted.join(
              ", "
            )} (forced=${force}, isCron=${isCronCall})`
          : `Attempted social autopost but no platforms succeeded. (forced=${force}, isCron=${isCronCall})`,
    });

    console.log("### SOCIAL AUTOPOST COMPLETE ###");

    return NextResponse.json({
      success: true,
      deal_id: deal.id,
      platforms: platformsPosted,
      nextRun: nextSocialRun,
      results,
      forced: force,
      isCron: isCronCall,
    });
  } catch (err) {
    console.error("❌ SOCIAL AUTOPOST ERROR:", err);

    try {
      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: new Date().toISOString(),
        action: "social_error",
        deals_published: 0,
        message: String(err),
      });
    } catch {
      // ignore logging failure
    }

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}