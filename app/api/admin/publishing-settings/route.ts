import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------
   GET → Fetch publishing + bump rules
------------------------------------------------------------- */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_settings")
    .select(
      `
        enabled,
        deals_per_cycle,
        interval_minutes,
        bump_enabled,
        bump_cooldown_hours,
        max_bumps_per_deal,
        allow_bump_if_expired
      `
    )
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/* -------------------------------------------------------------
   PUT → Update publishing + bump rules
------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const update = {
      enabled: Boolean(body.enabled),
      deals_per_cycle: Number(body.deals_per_cycle ?? 1),
      interval_minutes: Number(body.interval_minutes ?? 10),

      bump_enabled: Boolean(body.bump_enabled),
      bump_cooldown_hours: Number(body.bump_cooldown_hours ?? 12),
      max_bumps_per_deal:
        body.max_bumps_per_deal === null ||
        body.max_bumps_per_deal === ""
          ? null
          : Number(body.max_bumps_per_deal),

      allow_bump_if_expired: Boolean(body.allow_bump_if_expired),

      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("auto_publish_settings")
      .update(update)
      .eq("id", 1);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}
