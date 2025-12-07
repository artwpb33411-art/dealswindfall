import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const [{ data: settings }, { data: state }] = await Promise.all([
    supabaseAdmin.from("auto_publish_settings").select("*").eq("id", 1).single(),
    supabaseAdmin.from("auto_publish_state").select("*").eq("id", 1).single(),
  ]);

  return NextResponse.json({
    enabled: settings?.enabled,
    deals_per_cycle: settings?.deals_per_cycle,
    interval_minutes: settings?.interval_minutes,

    social_enabled: settings?.social_enabled,
    social_interval_minutes: settings?.social_interval_minutes,

    allowed_stores: settings?.allowed_stores || [],

    next_run: state?.next_run,
    last_run: state?.last_run,
    last_count: state?.last_count,
  });
}
