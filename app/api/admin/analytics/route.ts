// app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "Missing start or end date" },
        { status: 400 }
      );
    }

    const startIso = new Date(start).toISOString();
    const endIso = new Date(end + "T23:59:59").toISOString();

    /* ======================================================
       LOAD EVENTS (ONLY IN RANGE)
    ====================================================== */
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("analytics")
      .select("*")
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .order("created_at", { ascending: true });

    if (eventsError) throw eventsError;

    /* ======================================================
       NEW vs RETURNING VISITORS
       Using visitor_id; if missing, fallback to ip_address.
    ====================================================== */
    type VisitorKey = string;
    const visitorFirstSeen: Record<VisitorKey, string> = {};

    // Get first seen globally (across all time)
    const { data: allVisitors, error: visitorsErr } = await supabaseAdmin
      .from("analytics")
      .select("visitor_id, ip_address, created_at")
      .order("created_at", { ascending: true });

    if (visitorsErr) throw visitorsErr;

    allVisitors?.forEach((row) => {
      const key: VisitorKey =
        row.visitor_id || row.ip_address || "unknown-" + row.created_at;
      if (!visitorFirstSeen[key]) {
        visitorFirstSeen[key] = row.created_at;
      }
    });

    const visitorsInRange: Record<VisitorKey, boolean> = {};
    events.forEach((ev) => {
      const key: VisitorKey =
        ev.visitor_id || ev.ip_address || "unknown-" + ev.id;
      visitorsInRange[key] = true;
    });

    let newVisitors = 0;
    let returningVisitors = 0;

    Object.keys(visitorsInRange).forEach((key) => {
      const firstSeen = visitorFirstSeen[key];
      if (!firstSeen) return;
      if (firstSeen >= startIso && firstSeen <= endIso) {
        newVisitors++;
      } else {
        returningVisitors++;
      }
    });

    /* ======================================================
       BASIC COUNTS
    ====================================================== */
    let totalPageViews = 0;
    let totalDealClicks = 0;
    let totalOutboundClicks = 0;

    const pageCounts: Record<string, number> = {};
    const storeClicks: Record<string, number> = {};
    const categoryClicks: Record<string, number> = {};
    const dealClicks: Record<string, number> = {};

    events.forEach((ev: any) => {
      const page = ev.page ?? "(empty)";
      const store = ev.store ?? "(unknown)";
      const category = ev.category ?? "(unknown)";
      const dealId = ev.deal_id ?? null;

      if (ev.event_type === "view") {
        totalPageViews++;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      }

      if (ev.event_type === "click" && ev.event_name === "deal_click") {
        totalDealClicks++;
        if (ev.store) {
          storeClicks[store] = (storeClicks[store] || 0) + 1;
        }
        if (ev.category) {
          categoryClicks[category] = (categoryClicks[category] || 0) + 1;
        }
        if (dealId != null) {
          dealClicks[String(dealId)] =
            (dealClicks[String(dealId)] || 0) + 1;
        }
      }

      if (ev.event_type === "click" && ev.event_name === "deal_outbound_click") {
        totalOutboundClicks++;
      }
    });

    /* ======================================================
       DEALS PUBLISHED (STORE / CATEGORY)
    ====================================================== */
    const { data: deals, error: dealsErr } = await supabaseAdmin
      .from("deals")
      .select("id, store_name, category, status");

    if (dealsErr) throw dealsErr;

    const storeDealCounts: Record<string, number> = {};
    const categoryDealCounts: Record<string, number> = {};

    deals?.forEach((d: any) => {
      if (d.status !== "Published") return;
      const store = d.store_name ?? "(unknown)";
      const category = d.category ?? "(unknown)";
      storeDealCounts[store] = (storeDealCounts[store] || 0) + 1;
      categoryDealCounts[category] =
        (categoryDealCounts[category] || 0) + 1;
    });

    /* ======================================================
       CTR (Clicks / Deals Published)
    ====================================================== */
    const storeCTR: Record<string, number> = {};
    const categoryCTR: Record<string, number> = {};

    Object.keys(storeDealCounts).forEach((store) => {
      const clicks = storeClicks[store] || 0;
      const dealsCount = storeDealCounts[store] || 1;
      storeCTR[store] = clicks / dealsCount;
    });

    Object.keys(categoryDealCounts).forEach((cat) => {
      const clicks = categoryClicks[cat] || 0;
      const dealsCount = categoryDealCounts[cat] || 1;
      categoryCTR[cat] = clicks / dealsCount;
    });

    /* ======================================================
       RETURN JSON
    ====================================================== */
    return NextResponse.json({
      total_events: events.length,
      unique_visitors: Object.keys(visitorsInRange).length,
      new_visitors: newVisitors,
      returning_visitors: returningVisitors,

      total_page_views: totalPageViews,
      total_deal_clicks: totalDealClicks,
      total_outbound_clicks: totalOutboundClicks,

      page_counts: pageCounts,
      store_clicks: storeClicks,
      category_clicks: categoryClicks,
      deal_clicks: dealClicks,

      store_deal_counts: storeDealCounts,
      category_deal_counts: categoryDealCounts,

      store_ctr: storeCTR,
      category_ctr: categoryCTR,
    });
  } catch (err: any) {
    console.error("Analytics route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
