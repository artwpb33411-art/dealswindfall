import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_settings")
    .select(
      "bump_enabled, bump_cooldown_hours, max_bumps_per_deal, allow_bump_if_expired"
    )
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();

  const { error } = await supabaseAdmin
    .from("auto_publish_settings")
    .update({
      bump_enabled: body.bump_enabled,
      bump_cooldown_hours: body.bump_cooldown_hours,
      max_bumps_per_deal: body.max_bumps_per_deal,
      allow_bump_if_expired: body.allow_bump_if_expired,
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
