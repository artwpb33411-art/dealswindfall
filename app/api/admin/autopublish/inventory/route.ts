import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    /* ---------------------------------------------------------
       1. Count remaining Draft deals
    --------------------------------------------------------- */
    const { data: drafts, error: draftError } = await supabaseAdmin
      .from("deals")
      .select("id")
      .eq("status", "Draft");

    if (draftError) throw draftError;

    const remainingDrafts = drafts?.length || 0;

    /* ---------------------------------------------------------
       2. Load Auto-Publish Settings
    --------------------------------------------------------- */
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("auto_publish_settings")
      .select("interval_minutes, deals_per_cycle, enabled")
      .single();

    if (settingsError) throw settingsError;

    const { interval_minutes, deals_per_cycle, enabled } = settings;

    /* ---------------------------------------------------------
       3. Compute How Long Deals Will Last
    --------------------------------------------------------- */

    if (!enabled) {
      return NextResponse.json({
        enabled: false,
        remainingDrafts,
        deals_per_cycle,
        interval_minutes,
        estimated_hours: null,
        message: "Auto-publishing is disabled.",
      });
    }

    const cyclesAvailable = remainingDrafts / deals_per_cycle;
    const totalMinutes = cyclesAvailable * interval_minutes;
    const estimatedHours = totalMinutes / 60;

    return NextResponse.json({
      enabled,
      remainingDrafts,
      deals_per_cycle,
      interval_minutes,
      estimated_hours: estimatedHours,
    });
  } catch (err: any) {
    console.error("INVENTORY ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load inventory" },
      { status: 500 }
    );
  }
}
