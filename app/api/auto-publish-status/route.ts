import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const [
    { data: settings, error: settingsError },
    { data: state, error: stateError }
  ] = await Promise.all([
    supabaseAdmin.from("auto_publish_settings").select("*").eq("id", 1).single(),
    supabaseAdmin.from("auto_publish_state").select("*").eq("id", 1).single(),
  ]);

  if (settingsError || stateError || !settings || !state) {
    return NextResponse.json(
      { error: settingsError?.message ?? stateError?.message ?? "Missing settings/state row id=1" },
      { status: 500 }
    );
  }
return NextResponse.json({
  // Social Auto-Post (PRIMARY — matches UI)
  enabled: settings.social_enabled,
  social_last_run: state.social_last_run,
  social_next_run: state.social_next_run,
  social_last_count: state.social_last_count,
  social_last_deal: state.social_last_deal,

  // Deals Auto-Publish (optional / future)
  deals_enabled: settings.enabled,
  deals_last_run: state.last_run,
  deals_next_run: state.next_run,
  deals_last_count: state.last_count,
});


}
