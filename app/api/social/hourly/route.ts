import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { saveFlyerBufferToSupabase } from "@/lib/social/saveFlyerBuffer"; 
import { deleteStorageObject } from "@/lib/social/deleteStorageObject";
import { safeGenerateFlyers } from "@/lib/social/safeGenerateFlyers";
import type { SelectedDeal } from "@/lib/social/types";
import { buildCaption } from "@/lib/social/captionBuilder";

import { generateFlyer } from "@/lib/social/flyerGenerator";
import { generateFlyerSquare } from "@/lib/social/flyers/generateFlyerSquare";
import { generateFlyerStory } from "@/lib/social/flyers/generateFlyerStory";

import { publishToX } from "@/lib/social/publishers/x";
import { publishToTelegram } from "@/lib/social/publishers/telegram";
import { publishToFacebook } from "@/lib/social/publishers/facebook";
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


 
// 6️⃣ Fetch candidate deals (last 12 hours)
const since = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();

const baseQuery = supabaseAdmin
  .from("deals")
  .select(
    `
    id,
    description,
    notes,
    current_price,
    old_price,
    price_diff,
    percent_diff,
    image_link,
    product_link,
    review_link,
    store_name,
    slug,
    published_at,
    exclude_from_auto,
    is_affiliate,
    hash_tags
    `
  )
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
const DEDUPE_HOURS = 36;
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


// 6.1 Remove *last posted* deal (no immediate duplicates)
let available = rawDeals
  // Safety net: last deal
  .filter((d: any) => d.id !== state.social_last_deal)

  // Hard dedupe: recently posted
  .filter((d: any) => !recentlyPostedIds.has(d.id))

  // Discount sanity check
  .filter((d: any) => (d.percent_diff ?? 0) < 60);


// 6.3 If no qualified deals → DO NOT POST AT ALL (option A for now)
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

// 6.4 Pick one randomly from remaining pool
//const raw = available[Math.floor(Math.random() * available.length)];


    // 7️⃣ Pick a raw DB row and map → SelectedDeal
    const raw = available[Math.floor(Math.random() * available.length)];

    const deal: SelectedDeal = {
      id: raw.id,
      title: raw.description ?? "Untitled deal",
      description: raw.notes ?? null,
      image_link: raw.image_link ?? null,
      slug: raw.slug ?? null,
      store_name: raw.store_name ?? null,

      price: raw.current_price ?? null,
      old_price: raw.old_price ?? null,
      percent_diff: raw.percent_diff ?? null,

      current_price: raw.current_price ?? null,
      price_diff: raw.price_diff ?? null,
      product_link: raw.product_link ?? null,
      review_link: raw.review_link ?? null,
    };

    const logTitle =
      deal.title || deal.description || deal.slug || `Deal #${deal.id}`;

    console.log(
      "🎯 Selected deal:",
      logTitle,
      "| Discount:",
      deal.percent_diff
    );

    // 8️⃣ Prepare image
    let finalImage: string | null = deal.image_link;

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

const flyers = await safeGenerateFlyers(deal, finalImage);

const portraitBuffer = flyers.portrait;
const squareBuffer = flyers.square;
const storyBuffer = flyers.story;

const { portrait, square, story } =
  await safeGenerateFlyers(deal, finalImage);

const portraitBase64 = portrait.toString("base64");
const squareBase64 = square.toString("base64");
const storyBase64 = story.toString("base64");



    // 🔟 Build captions (long + short + URL)

const aiHashtags = normalizeHashtags(raw.hash_tags);

// Always include brand hashtag
const finalHashtags = Array.from(
  new Set([
    "#dealswindfall",
    ...aiHashtags,
  ])
);


   const social = buildCaption(deal, aiHashtags);


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
    });

    throw err;
  }
}

// 🔟.5️⃣ Publish to enabled platforms

if (platforms.x) {
  await tryPost("x", () =>
    publishToX(social.short, squareBase64)
  );
}

if (platforms.telegram) {
  await tryPost("telegram", () =>
    publishToTelegram(social.text, squareBase64)
  );
}

if (platforms.facebook) {
  await tryPost("facebook", () =>
    publishToFacebook(social.text, portraitBase64)
  );
}

if (platforms.instagram) {
  await tryPost("instagram", async () => {
    const stored = await saveFlyerBufferToSupabase(portraitBuffer, "jpg");

    try {
      const res = await publishToInstagram(
        social.text,
        stored.publicUrl
      );

      // ✅ cleanup after successful publish
      await deleteStorageObject(stored.bucket, stored.path);

      return res;
    } catch (err) {
      // ❌ keep file if publish fails
      throw err;
    }
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
