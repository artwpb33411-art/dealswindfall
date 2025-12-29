import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    /* ---------------------------------------------------------
       1. Count publishable Draft deals (matches runner exactly)
    --------------------------------------------------------- */
    const { count, error: draftError } = await supabaseAdmin
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "Draft")
      .eq("exclude_from_auto", false)
      .is("superseded_by_id", null);

    if (draftError) throw draftError;

    const remainingDrafts = count ?? 0;

    /* ---------------------------------------------------------
       2. Load Auto-Publish Settings
    --------------------------------------------------------- */
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("auto_publish_settings")
      .select("interval_minutes, deals_per_cycle, enabled")
      .single();

    if (settingsError) throw settingsError;

    const { interval_minutes, deals_per_cycle, enabled } = settings;

    const effectiveDealsPerCycle = Math.max(1, deals_per_cycle ?? 1);

    /* ---------------------------------------------------------
       3. Compute Inventory Duration
    --------------------------------------------------------- */
    if (!enabled || remainingDrafts === 0) {
      return NextResponse.json({
        enabled,
        remainingDrafts,
        deals_per_cycle: effectiveDealsPerCycle,
        interval_minutes,
        estimated_hours: null,
      });
    }

    const cyclesAvailable = remainingDrafts / effectiveDealsPerCycle;
    const totalMinutes = cyclesAvailable * interval_minutes;
    const estimatedHours = totalMinutes / 60;

    return NextResponse.json({
      enabled,
      remainingDrafts,
      deals_per_cycle: effectiveDealsPerCycle,
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
