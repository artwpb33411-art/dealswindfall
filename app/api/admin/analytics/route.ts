import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: totalViews } = await supabaseAdmin
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "page_view");

    const { data: uniqueVisitors } = await supabaseAdmin
      .from("analytics_events")
      .select("user_id", { count: "exact", head: true })
      .eq("event_type", "page_view");

    const { data: topStores } = await supabaseAdmin
      .from("analytics_events")
      .select("store, count:store", { groupBy: "store" });

    const { data: sources } = await supabaseAdmin
      .from("analytics_events")
      .select("referrer, count:referrer", { groupBy: "referrer" });

    return NextResponse.json({
      totalViews: totalViews?.length || 0,
      uniqueVisitors: uniqueVisitors?.length || 0,
      topStore: topStores?.[0]?.store || "N/A",
      sources: sources || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
