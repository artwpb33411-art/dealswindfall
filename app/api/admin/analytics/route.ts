import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Total events
    const { count: totalEvents } = await supabaseAdmin
      .from("analytics_events")
      .select("*", { count: "exact", head: true });

    // Event type breakdown
    const { data: eventTypes } = await supabaseAdmin
      .from("analytics_events")
      .select("event_type");

    const typeCounts: Record<string, number> = {};
    eventTypes?.forEach((e) => {
      typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
    });

    // Top pages
    const { data: pages } = await supabaseAdmin
      .from("analytics_events")
      .select("page");

    const pageCounts: Record<string, number> = {};
    pages?.forEach((p) => {
      pageCounts[p.page] = (pageCounts[p.page] || 0) + 1;
    });

    return NextResponse.json({
      total_events: totalEvents ?? 0,
      event_type_counts: typeCounts,
      page_counts: pageCounts,
    });
  } catch (err: any) {
    console.error("Analytics route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
