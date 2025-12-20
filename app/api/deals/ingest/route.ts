import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------
   Helpers (same style as existing code)
------------------------------------------------------------- */
function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000")
  );
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
    // Failsafe defaults (matches current behavior)
    return {
      bump_enabled: true,
      bump_cooldown_hours: 12,
      max_bumps_per_deal: null,
      allow_bump_if_expired: false,
    };
  }

  return data;
}

function normalizeImageUrl(url: string) {
  try {
    const u = new URL(url);
    u.search = ""; // remove resizing params
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
  // Amazon ASIN
  const asin = url.match(/\/dp\/([A-Z0-9]{10})/i);
  if (asin) return `amazon:${asin[1].toUpperCase()}`;

  return `url:${normalizeProductUrl(url)}`;
}

/*
function canBump(existing: any) {
  if (existing.exclude_from_auto) return false;
  if (existing.expire_date && new Date(existing.expire_date) < new Date()) {
    return false;
  }

  if (!existing.last_bumped_at) return true;

  const hours =
    (Date.now() - new Date(existing.last_bumped_at).getTime()) / 36e5;

  return hours >= 12; // configurable
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000")
  );
}
*/


function canBump(existing: any, rules: any) {
  if (!rules.bump_enabled) return false;

  if (
    !rules.allow_bump_if_expired &&
    existing.expire_date &&
    new Date(existing.expire_date) < new Date()
  ) {
    return false;
  }

  if (
    rules.max_bumps_per_deal !== null &&
    existing.bump_count >= rules.max_bumps_per_deal
  ) {
    return false;
  }

  if (!existing.last_bumped_at) return true;

  const hoursSince =
    (Date.now() - new Date(existing.last_bumped_at).getTime()) / 36e5;

  return hoursSince >= rules.bump_cooldown_hours;
}


/* -------------------------------------------------------------
   POST → Ingest Deal (SOURCE OF TRUTH)
------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ai_requested = true } = body;

    if (!body.description?.trim()) {
      return NextResponse.json(
        { result: "error", message: "Missing title" },
        { status: 400 }
      );
    }
    if (!body.productLink?.trim()) {
      return NextResponse.json(
        { result: "error", message: "Missing product link" },
        { status: 400 }
      );
    }

    const current_price = body.currentPrice ? Number(body.currentPrice) : null;
    const old_price = body.oldPrice ? Number(body.oldPrice) : null;

    const product_link_norm = normalizeProductUrl(body.productLink);
    const product_key = buildProductKey(body.productLink);

    /* ---------------------------------------------------------
       Find existing active deal
    --------------------------------------------------------- */
    const { data: existing } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("product_key", product_key)
      .eq("status", "Published")
      .is("superseded_by_id", null)
      .order("feed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    /* ---------------------------------------------------------
       CASE A — NEW DEAL
    --------------------------------------------------------- */
    if (!existing) {
      const payload = {
        description: body.description,
        notes: body.notes || "",
        description_es: body.description_es || body.description,
        notes_es: body.notes_es || body.notes || "",

        store_name: body.storeName || null,
        category: body.category || null,

        current_price,
        old_price,

        image_link: body.imageLink || null,
        product_link: body.productLink,
        product_link_norm,
        product_key,

        review_link: body.reviewLink || null,
        coupon_code: body.couponCode || null,
        shipping_cost: body.shippingCost || null,
        expire_date: body.expireDate || null,
        holiday_tag: body.holidayTag || null,

        slug: slugify(body.description),
        slug_es: slugify(body.description_es || body.description),

        status: "Draft",
        publish_action: "insert",
        ingest_result: "inserted",
        ai_status: ai_requested ? "pending" : "skipped",
        is_affiliate: body.is_affiliate || false,
        affiliate_source: body.affiliate_source || null,
      };

      const { data, error } = await supabaseAdmin
        .from("deals")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Fire-and-forget AI
      if (ai_requested) {
        fetch(`${getBaseUrl()}/api/ai/process-deal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId: data.id }),
        }).catch(console.error);
      }

      return NextResponse.json({
        result: "inserted",
        message: "New deal created successfully.",
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
      const payload = {
        description: body.description,
        notes: body.notes || "",
        description_es: body.description_es || body.description,
        notes_es: body.notes_es || body.notes || "",

        store_name: body.storeName || null,
        category: body.category || null,

        current_price,
        old_price,

        image_link: body.imageLink
  ? normalizeImageUrl(body.imageLink)
  : null,

        product_link: body.productLink,
        product_link_norm,
        product_key,

        review_link: body.reviewLink || null,
        coupon_code: body.couponCode || null,
        shipping_cost: body.shippingCost || null,
        expire_date: body.expireDate || null,
        holiday_tag: body.holidayTag || null,

        slug: slugify(body.description),
        slug_es: slugify(body.description_es || body.description),

        status: "Draft",
        publish_action: "insert",
        canonical_to_id: existing.id,
        ingest_result: "superseded_old",
        ai_status: ai_requested ? "pending" : "skipped",
        is_affiliate: body.is_affiliate || false,
        affiliate_source: body.affiliate_source || null,
      };

      const { data, error } = await supabaseAdmin
        .from("deals")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (ai_requested) {
        fetch(`${getBaseUrl()}/api/ai/process-deal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId: data.id }),
        }).catch(console.error);
      }

      return NextResponse.json({
        result: "superseded_old",
        message: "Price changed. Older deal will be superseded.",
        old_deal_id: existing.id,
        new_deal_id: data.id,
      });
    }

    /* ---------------------------------------------------------
       CASE C — SAME PRICE → BUMP
    --------------------------------------------------------- */
   const rules = await getPublishingRules();

if (canBump(existing, rules)) {

      await supabaseAdmin.from("deals").insert({
        status: "Draft",
        publish_action: "bump_existing",
        canonical_to_id: existing.id,
        ingest_result: "bumped_existing",
      });

      return NextResponse.json({
        result: "bumped_existing",
        message:
          "This product already exists at the same price. The existing deal was moved to the top.",
        existing_deal_id: existing.id,
      });
    }

    /* ---------------------------------------------------------
       CASE D — SKIP
    --------------------------------------------------------- */
    return NextResponse.json({
      result: "skipped_duplicate",
      message:
        "This deal already exists and was recently promoted. No action was taken.",
      existing_deal_id: existing.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { result: "error", message: err.message || "Ingest failed" },
      { status: 500 }
    );
  }
}
