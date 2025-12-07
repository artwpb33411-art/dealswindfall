import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabaseAdmin
    .from("auto_publish_settings")
    .update({
      enabled: body.enabled,
      deals_per_cycle: body.deals_per_cycle,
      interval_minutes: body.interval_minutes,

      // NEW FIELDS
      social_enabled: body.social_enabled,
      social_interval_minutes: body.social_interval_minutes,
      allowed_stores: body.allowed_stores,

      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
