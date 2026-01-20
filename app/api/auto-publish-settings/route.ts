import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* =========================
   GET SETTINGS
========================= */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    social_enabled: data.social_enabled ?? true,
    social_interval_minutes: data.social_interval_minutes ?? 60,
    allowed_stores: data.allowed_stores ?? ["Amazon", "Walmart"],
  });
}

/* =========================
   POST SETTINGS
========================= */
export async function POST(req: Request) {
  const body = await req.json();

  // 🛡️ Basic validation helpers
  function isValidRatio(a: number, b: number) {
    return (
      Number.isInteger(a) &&
      Number.isInteger(b) &&
      a >= 0 &&
      b >= 0 &&
      !(a === 0 && b === 0)
    );
  }

  if (body.social_enable_ratios) {
    if (
      !isValidRatio(
        body.social_affiliate_ratio,
        body.social_non_affiliate_ratio
      )
    ) {
      return NextResponse.json(
        { error: "Invalid affiliate ratio" },
        { status: 400 }
      );
    }

    if (
      !isValidRatio(
        body.social_en_ratio,
        body.social_es_ratio
      )
    ) {
      return NextResponse.json(
        { error: "Invalid language ratio" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(body.social_ratio_window_posts) ||
      body.social_ratio_window_posts < 1
    ) {
      return NextResponse.json(
        { error: "Invalid ratio window size" },
        { status: 400 }
      );
    }
  }

  const { error } = await supabaseAdmin
    .from("auto_publish_settings")
    .update({
      enabled: body.enabled,
      deals_per_cycle: body.deals_per_cycle,
      interval_minutes: body.interval_minutes,

      // Social controls
      social_enabled: body.social_enabled,
      social_interval_minutes: body.social_interval_minutes,
      allowed_stores: body.allowed_stores,
      social_affiliate_only: body.social_affiliate_only,

      // Ratio controls
      social_enable_ratios: body.social_enable_ratios,
      social_affiliate_ratio: body.social_affiliate_ratio,
      social_non_affiliate_ratio: body.social_non_affiliate_ratio,
      social_en_ratio: body.social_en_ratio,
      social_es_ratio: body.social_es_ratio,
      social_ratio_window_posts: body.social_ratio_window_posts,

      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
