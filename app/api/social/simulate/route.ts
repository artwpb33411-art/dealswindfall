import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDeal } from "@/lib/social/normalizeDeal";
import { safeGenerateFlyers } from "@/lib/social/safeGenerateFlyers";
import { buildCaption, buildPlatformCaptions } from "@/lib/social/captionBuilder";

export const runtime = "nodejs";

function isInQuietHours(hour: number, start: number, end: number): boolean {
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function detectLanguage(raw: any): "en" | "es" {
  return raw.slug_es || raw.description_es || raw.notes_es
    ? "es"
    : "en";
}

function resolveHashtags(
  rawDeal: any,
  lang: "en" | "es"
): string[] {
  const source =
    lang === "es"
      ? rawDeal.hashtags_es
      : rawDeal.hash_tags;

  if (Array.isArray(source)) return source;

  if (typeof source === "string") {
    return source
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET() {
  const now = new Date();

  // 1) Load settings/state/platforms
  const [
    { data: settings, error: settingsError },
    { data: state, error: stateError },
    { data: platforms, error: platformsError },
  ] = await Promise.all([
    supabaseAdmin.from("auto_publish_settings").select("*").eq("id", 1).single(),
    supabaseAdmin.from("auto_publish_state").select("*").eq("id", 1).single(),
    supabaseAdmin
      .from("auto_publish_platforms")
      .select("x, telegram, facebook, instagram, reddit")
      .eq("id", 1)
      .single(),
  ]);

  if (settingsError || stateError || platformsError || !settings || !state) {
    return NextResponse.json(
      { error: "Missing settings/state/platforms", settingsError, stateError, platformsError },
      { status: 500 }
    );
  }

  // 2) Quiet hours check (simulation always shows outcome)
  const estHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      hour12: false,
    }).format(now)
  );

  const quietStart = settings.social_quiet_start_hour ?? 1;
  const quietEnd = settings.social_quiet_end_hour ?? 5;

  const quietHoursActive = isInQuietHours(estHour, quietStart, quietEnd);

  // 3) Freshness window
  const intervalMinutes: number = settings.social_interval_minutes ?? 60;
  const windowStart =
    state.social_last_run
      ? new Date(state.social_last_run)
      : new Date(now.getTime() - intervalMinutes * 60_000);

  const since = windowStart.toISOString();

  // 4) Allowed stores
  const allowedStores: string[] =
    settings.allowed_stores?.length > 0 ? settings.allowed_stores : ["Amazon", "Walmart"];

  // 5) Fetch candidate deals
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

  const { data: rawDeals, error: dealsError } = await baseQuery
    .order("published_at", { ascending: false })
    .limit(200);

  if (dealsError) {
    return NextResponse.json({ error: dealsError.message }, { status: 500 });
  }

  // 6) Dedupe recent posts
  const DEDUPE_HOURS = 36;
  const dedupeSince = new Date(now.getTime() - DEDUPE_HOURS * 60 * 60 * 1000).toISOString();

  const { data: recentPosts, error: recentErr } = await supabaseAdmin
    .from("social_post_log")
    .select("deal_id")
    .gte("posted_at", dedupeSince);

  if (recentErr) return NextResponse.json({ error: recentErr.message }, { status: 500 });

  const recentlyPostedIds = new Set((recentPosts ?? []).map((r: any) => r.deal_id));

  // 7) Build available pool
  let available =
    (rawDeals ?? [])
      .filter((d: any) => d.id !== state.social_last_deal)
      .filter((d: any) => !recentlyPostedIds.has(d.id))
      .filter((d: any) => (d.percent_diff ?? 0) < 60);

  const affiliateOnly = !!settings.social_affiliate_only;
  if (affiliateOnly) {
    const onlyAff = available.filter((d: any) => d.is_affiliate === true);
    if (onlyAff.length > 0) available = onlyAff;
  }

  // 8) Compute ratio preference
  const ratioEnabled = settings.social_enable_ratios ?? true;
  const ratioWindow = settings.social_ratio_window_posts ?? 10;

  let preferAffiliate: boolean | null = null;
 let postLang: "en" | "es" = "en";

let enCount = 0;
let esCount = 0;


if (ratioEnabled) {
  const enRatio = settings.social_en_ratio ?? 3;
  const esRatio = settings.social_es_ratio ?? 1;

  if (enRatio === 0 && esRatio > 0) {
    postLang = "es";
  } else if (esRatio === 0 && enRatio > 0) {
    postLang = "en";
  } else {
    postLang =
      enCount / enRatio < esCount / esRatio ? "en" : "es";
  }
}



  let ratioStats: any = null;

  if (ratioEnabled) {
    const { data: recentSocial, error: ratioErr } = await supabaseAdmin
      .from("social_post_log")
      .select("is_affiliate, language")
      .eq("post_mode", "auto")
      .order("posted_at", { ascending: false })
      .limit(ratioWindow);

    if (ratioErr) return NextResponse.json({ error: ratioErr.message }, { status: 500 });

    const affiliateCount = recentSocial?.filter(r => r.is_affiliate === true).length ?? 0;
    const nonAffiliateCount = recentSocial?.filter(r => r.is_affiliate === false).length ?? 0;
    const enCount = recentSocial?.filter(r => (r.language ?? "en") === "en").length ?? 0;
    const esCount = recentSocial?.filter(r => r.language === "es").length ?? 0;

    const affRatio = settings.social_affiliate_ratio ?? 4;
    const nonAffRatio = settings.social_non_affiliate_ratio ?? 1;
    const enRatio = settings.social_en_ratio ?? 3;
    const esRatio = settings.social_es_ratio ?? 1;

    preferAffiliate = affiliateCount / affRatio < nonAffiliateCount / nonAffRatio;
   if (esRatio === 0 && enRatio > 0) {
  postLang = "en";
} else if (enRatio === 0 && esRatio > 0) {
  postLang = "es";
} else {
  postLang =
    enCount / enRatio <= esCount / esRatio ? "en" : "es";
}


    ratioStats = { ratioWindow, affiliateCount, nonAffiliateCount, enCount, esCount, affRatio, nonAffRatio, enRatio, esRatio };
  }

  // 9) Select deal (no posting)
  let candidates = [...available];

  const reasons: string[] = [];

  if (available.length === 0) {
    return NextResponse.json({
      now,
      quietHoursActive,
      estHour,
      window: { since, lastRun: state.social_last_run, intervalMinutes },
      allowedStores,
      affiliateOnly,
      ratioEnabled,
      ratioStats,
      eligibleCount: 0,
      selected: null,
      reasons: ["No eligible deals after filters (freshness/dedupe/discount/etc)."],
    });
  }

  if (ratioEnabled && preferAffiliate != null) {
    const affPreferred = candidates.filter(d => d.is_affiliate === preferAffiliate);
    if (affPreferred.length > 0) {
      candidates = affPreferred;
      reasons.push(`Applied affiliate preference: preferAffiliate=${preferAffiliate}`);
    } else {
      reasons.push(`Affiliate preference unavailable, fallback used.`);
    }
  }

  

  candidates.sort((a: any, b: any) => {
    const ta = new Date(a.published_at ?? a.created_at ?? 0).getTime();
    const tb = new Date(b.published_at ?? b.created_at ?? 0).getTime();
    return ta - tb;
  });

  const selectedRawDeal = candidates[0];
  const deal = normalizeDeal(selectedRawDeal);
//let postLang: "en" | "es" = "en";
  // 10) Generate preview artifacts (flyers + captions)
  const { portrait, square, story } = await safeGenerateFlyers(deal, postLang);

  const flyers = {
    portrait: portrait.toString("base64"),
    square: square.toString("base64"),
    story: story.toString("base64"),
  };
//const hashtags = resolveHashtags(rawDeal, postLang);

  const hashtags = Array.isArray(selectedRawDeal.hash_tags)
    ? selectedRawDeal.hash_tags
    : (selectedRawDeal.hash_tags ?? "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

  const social = buildCaption(deal, hashtags, postLang);
const lang = detectLanguage(selectedRawDeal);

  const platformCaptions = buildPlatformCaptions(
    deal,
    hashtags,
    postLang 
  );

  return NextResponse.json({
    now,
    quietHoursActive,
    estHour,
    window: { since, lastRun: state.social_last_run, intervalMinutes },
    allowedStores,
    platformsEnabled: platforms,
    affiliateOnly,
    ratioEnabled,
    ratioStats,
    eligibleCount: available.length,
    selected: {
      id: deal.id,
      title: deal.title ?? deal.description ?? deal.slug ?? `Deal #${deal.id}`,
      store: deal.store_name,
      language: postLang,


      is_affiliate: !!deal.is_affiliate,
      published_at: selectedRawDeal.published_at ?? null,
      percent_diff: deal.percent_diff ?? null,
    },
    reasons,
    flyers,
    captions: {
      base: social,
      facebook: platformCaptions.captions?.facebook ?? null,
      instagram: platformCaptions.captions?.instagram ?? null,
      telegram: platformCaptions.captions?.telegram ?? null,
      x: platformCaptions.captions?.x ?? null,
      url: platformCaptions.url ?? null,
    },
  });
}
