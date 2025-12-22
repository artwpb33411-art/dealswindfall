//console.log("INGEST BODY >>>", body);


import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000")
  );
}
function normalizeImageUrl(url: string) {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}


function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeProductUrl(url: string) {
  try {
    const u = new URL(url.toLowerCase());
    u.hash = "";
    ["utm_source","utm_medium","utm_campaign","ref","tag","affid"].forEach(p =>
      u.searchParams.delete(p)
    );
    u.searchParams.sort();
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
}

function buildProductKey(url: string) {
  const asin = url.match(/\/dp\/([A-Z0-9]{10})/i);
  if (asin) return `amazon:${asin[1].toUpperCase()}`;
  return `url:${normalizeProductUrl(url)}`;
}

async function getPublishingRules() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_settings")
    .select(
      "bump_enabled, bump_cooldown_hours, max_bumps_per_deal, allow_bump_if_expired"
    )
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(
      "Publishing rules missing: auto_publish_settings (id=1) not found"
    );
  }

  return data;
}


function canBump(existing: any, rules: any) {
  if (!rules.bump_enabled) return false;
  if (
    !rules.allow_bump_if_expired &&
    existing.expire_date &&
    new Date(existing.expire_date) < new Date()
  ) return false;

  if (
    rules.max_bumps_per_deal !== null &&
    existing.bump_count >= rules.max_bumps_per_deal
  ) return false;

  if (!existing.last_bumped_at) return true;

  const hours =
    (Date.now() - new Date(existing.last_bumped_at).getTime()) / 36e5;

  return hours >= rules.bump_cooldown_hours;
}

async function triggerAIIfNeeded(
  result: "inserted" | "superseded_old",
  dealId: number,
  ai_requested: boolean
) {
  if (!ai_requested) return;
  if (result !== "inserted" && result !== "superseded_old") return;

  fetch(`${getBaseUrl()}/api/ai/process-deal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealId }),
  }).catch(console.error);
}

/* -------------------------------------------------------------
   POST → INGEST DEAL (SOURCE OF TRUTH)
------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    
    const raw = await req.json();

const body = {
  // text
  description: raw.description,
  notes: raw.notes,
  description_es: raw.description_es,
  notes_es: raw.notes_es,

  // prices
  current_price: raw.current_price ?? raw.currentPrice ?? null,
  old_price: raw.old_price ?? raw.oldPrice ?? null,

  // links
  product_link: raw.product_link ?? raw.productLink ?? null,
  image_link: raw.image_link ?? raw.imageLink ?? null,
  review_link: raw.review_link ?? raw.reviewLink ?? null,

  // meta
  coupon_code: raw.coupon_code ?? raw.couponCode ?? null,
  shipping_cost: raw.shipping_cost ?? raw.shippingCost ?? null,
  expire_date: raw.expire_date ?? raw.expireDate ?? null,

  category: raw.category,
  store_name: raw.store_name ?? raw.storeName ?? null,
  holiday_tag: raw.holiday_tag ?? raw.holidayTag ?? null,

  // identity / affiliate
  asin: raw.asin ?? null,
  upc: raw.upc ?? null,
  is_affiliate: raw.is_affiliate ?? false,
  affiliate_source: raw.affiliate_source ?? null,
  affiliate_priority: raw.affiliate_priority ?? 0,

  // flags
  ai_requested: raw.ai_requested ?? true,
};

console.log("INGEST BODY >>>", body);


    
    const { ai_requested = true } = body;

    if (!body.description?.trim()) {
      return NextResponse.json(
        { result: "error", message: "Missing title" },
        { status: 400 }
      );
    }

    if (!body.product_link?.trim()) {
      return NextResponse.json(
        { result: "error", message: "Missing product link" },
        { status: 400 }
      );
    }

    const current_price =
      body.current_price !== null ? Number(body.current_price) : null;
    const old_price =
      body.old_price !== null ? Number(body.old_price) : null;

    const product_link_norm = normalizeProductUrl(body.product_link);
    const product_key = buildProductKey(body.product_link);

    /* ---------------------------------------------------------
       Find active existing deal
    --------------------------------------------------------- */
    const { data: existing } = await supabaseAdmin
  .from("deals")
  .select("*")
  .eq("product_key", product_key)
  .is("superseded_by_id", null)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();


    /* ---------------------------------------------------------
       CASE A — NEW DEAL
    --------------------------------------------------------- */
    if (!existing) {
      const { data, error } = await supabaseAdmin
        .from("deals")
        .insert({
          description: body.description,
          notes: body.notes || null,
          description_es: body.description_es || body.description,
          notes_es: body.notes_es || null,

          store_name: body.store_name || null,
          category: body.category || null,

          current_price,
          old_price,

          image_link: body.image_link || null,
          product_link: body.product_link,
          product_link_norm,
          product_key,

          review_link: body.review_link || null,
          coupon_code: body.coupon_code || null,
          shipping_cost: body.shipping_cost || null,
          expire_date: body.expire_date || null,
          holiday_tag: body.holiday_tag || null,

          slug: slugify(body.description),
          slug_es: slugify(body.description_es || body.description),

          status: "Draft",
          publish_action: "insert",
          ai_status: ai_requested ? "pending" : "skipped",
          feed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await triggerAIIfNeeded("inserted", data.id, ai_requested);

      return NextResponse.json({
        result: "inserted",
        deal_id: data.id,
      });
    }

    /* ---------------------------------------------------------
   CASE B — PRICE CHANGED → SUPERSEDE
--------------------------------------------------------- */
if (
  current_price !== null &&
  existing.current_price !== null &&
  current_price !== existing.current_price
) {
  const insertPayload = {
    description: body.description,
    notes: body.notes || null,
    description_es: body.description_es || body.description,
    notes_es: body.notes_es || null,

    store_name: body.store_name || null,
    category: body.category || null,

    current_price,
    old_price,

    image_link: body.image_link ? normalizeImageUrl(body.image_link) : null,

    product_link: body.product_link!,
    product_link_norm,
    product_key,

    review_link: body.review_link || null,
    coupon_code: body.coupon_code || null,
    shipping_cost: body.shipping_cost || null,
    expire_date: body.expire_date || null,
    holiday_tag: body.holiday_tag || null,

    slug: slugify(body.description),
    slug_es: slugify(body.description_es || body.description),

    status: "Draft",
    publish_action: "insert",
    canonical_to_id: existing.id,
   // ingest_result: "superseded_old",
    ai_status: ai_requested ? "pending" : "skipped",

    // affiliate/identity fields (optional but good)
    asin: body.asin || null,
    upc: body.upc || null,
    is_affiliate: body.is_affiliate || false,
    affiliate_source: body.affiliate_source || null,
    affiliate_priority: body.affiliate_priority || 0,

    feed_at: new Date().toISOString(),
  };

  const { data: newDeal, error: insertError } = await supabaseAdmin
    .from("deals")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError || !newDeal) {
    throw insertError || new Error("Failed to insert superseding deal");
  }

  // Mark OLD as superseded + prevent auto-publish
  const { error: updateError } = await supabaseAdmin
    .from("deals")
    .update({
      superseded_by_id: newDeal.id,
      superseded_at: new Date().toISOString(),
      exclude_from_auto: true,
      status: "Draft",
    })
    .eq("id", existing.id);

  if (updateError) throw updateError;

  await triggerAIIfNeeded("superseded_old", newDeal.id, ai_requested);

  return NextResponse.json({
    result: "superseded_old",
    message: "Price changed — old deal superseded.",
    old_deal_id: existing.id,
    new_deal_id: newDeal.id,
  });
}

    /* ---------------------------------------------------------
       CASE C — SAME PRICE → BUMP
    --------------------------------------------------------- */
    const rules = await getPublishingRules();

    if (canBump(existing, rules)) {
      await supabaseAdmin
        .from("deals")
        .update({
          bump_count: existing.bump_count + 1,
          last_bumped_at: new Date().toISOString(),
          feed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return NextResponse.json({
        result: "bumped_existing",
        existing_deal_id: existing.id,
      });
    }

    /* ---------------------------------------------------------
       CASE D — SKIP
    --------------------------------------------------------- */
    return NextResponse.json({
      result: "skipped_duplicate",
      existing_deal_id: existing.id,
    });

  } catch (err: any) {
  console.error("INGEST ROUTE CRASH >>>", err);
  console.error("INGEST ROUTE CRASH STRING >>>", String(err));

  return NextResponse.json(
    {
      result: "error",
      message:
        err?.message ||
        err?.details ||
        err?.hint ||
        "Ingest failed (see server logs)",
    },
    { status: 500 }
  );
}

}
