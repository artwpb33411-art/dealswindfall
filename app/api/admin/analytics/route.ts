// app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


function normalizeBrowser(device: string | null, ua: string | null) {
  const s = (device || ua || "").toLowerCase();

  if (s.includes("edg")) return "Edge";
  if (s.includes("chrome") && !s.includes("edg")) return "Chrome";
  if (s.includes("firefox")) return "Firefox";
  if (s.includes("safari") && !s.includes("chrome")) return "Safari";
  if (s.includes("samsungbrowser")) return "Samsung Internet";
  if (s.includes("vercel")) return "Vercel Bot";
  if (s.includes("google-read-aloud")) return "Google Bot";

  return "Other";
}



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

    // Use full-day range in UTC
    const startIso = new Date(start).toISOString();
    const endIso = new Date(end + "T23:59:59").toISOString();

    /* ======================================================
       1️⃣ EVENTS IN DATE RANGE
    ====================================================== */
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("analytics")
      .select("*")
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .order("created_at", { ascending: true });

    if (eventsError) throw eventsError;

    /* ======================================================
       2️⃣ NEW vs RETURNING VISITORS
       - Uses visitor_id when available
       - Falls back to ip_address
    ====================================================== */
    type VisitorKey = string;
    const visitorFirstSeen: Record<VisitorKey, string> = {};

    // First seen globally (all time)
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
    events.forEach((ev: any) => {
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
       3️⃣ BASIC COUNTS & CLICK AGGREGATION
    ====================================================== */
    let totalPageViews = 0;
    let totalDealClicks = 0;
    let totalOutboundClicks = 0;

    const pageCounts: Record<string, number> = {};
    const storeClicks: Record<string, number> = {};
    const categoryClicks: Record<string, number> = {};
    const dealClicks: Record<string, number> = {};

    const internalDealClicks: Record<string, number> = {};
    const outboundDealClicks: Record<string, number> = {};

    events.forEach((ev: any) => {
      const page = ev.page ?? "(empty)";
      const store = ev.store ?? "(unknown)";
      const category = ev.category ?? "(unknown)";
      const dealId = ev.deal_id ?? null;
      const dealKey = dealId != null ? String(dealId) : null;

      // PAGE VIEWS
      if (ev.event_type === "view") {
        totalPageViews++;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      }

      // INTERNAL DEAL CLICK (list pane)
      if (ev.event_type === "click" && ev.event_name === "deal_click") {
        totalDealClicks++;

        if (ev.store) {
          storeClicks[store] = (storeClicks[store] || 0) + 1;
        }
        if (ev.category) {
          categoryClicks[category] = (categoryClicks[category] || 0) + 1;
        }
        if (dealKey) {
          dealClicks[dealKey] = (dealClicks[dealKey] || 0) + 1;
          internalDealClicks[dealKey] =
            (internalDealClicks[dealKey] || 0) + 1;
        }
      }

      // OUTBOUND CLICK (to Amazon / Walmart etc.)
      if (
        ev.event_type === "click" &&
        ev.event_name === "deal_outbound_click"
      ) {
        totalOutboundClicks++;
        if (dealKey) {
          outboundDealClicks[dealKey] =
            (outboundDealClicks[dealKey] || 0) + 1;
        }
      }
    });

    /* ======================================================
       4️⃣ DEALS PUBLISHED IN DATE RANGE (CTR denominator)
       - This is where Option A CTR happens.
    ====================================================== */
    const { data: dealsForCTR, error: dealsErr } = await supabaseAdmin
      .from("deals")
      .select("id, store_name, category, status, published_at")
      .eq("status", "Published")
      .gte("published_at", startIso)
      .lte("published_at", endIso);

    if (dealsErr) throw dealsErr;

    const storeDealCounts: Record<string, number> = {};
    const categoryDealCounts: Record<string, number> = {};

    dealsForCTR?.forEach((d: any) => {
      const store = d.store_name ?? "(unknown)";
      const category = d.category ?? "(unknown)";
      storeDealCounts[store] = (storeDealCounts[store] || 0) + 1;
      categoryDealCounts[category] =
        (categoryDealCounts[category] || 0) + 1;
    });

    /* ======================================================
       5️⃣ CTR CALCULATION (Store / Category)
       CTR = clicks (in date range) / deals published (in date range)
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
       6️⃣ TOP DEALS (INTERNAL + OUTBOUND)
       - Based on clicks during date range
       - Enriched with description + store_name + category
    ====================================================== */
    const clickedDealIds = Array.from(
      new Set([
        ...Object.keys(internalDealClicks),
        ...Object.keys(outboundDealClicks),
      ])
    ).map((id) => Number(id));

    let dealMetaMap: Record<string, any> = {};

    if (clickedDealIds.length > 0) {
      const { data: dealsForClicks, error: metaErr } = await supabaseAdmin
        .from("deals")
        .select("id, description, store_name, category")
        .in("id", clickedDealIds);

      if (metaErr) throw metaErr;

      (dealsForClicks || []).forEach((d: any) => {
        dealMetaMap[String(d.id)] = d;
      });
    }

    const topInternalDeals = Object.entries(internalDealClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([dealId, clicks]) => {
        const meta = dealMetaMap[dealId] || {};
        return {
          deal_id: Number(dealId),
          clicks,
          description: meta.description ?? null,
          store_name: meta.store_name ?? null,
          category: meta.category ?? null,
          internal_url: `/deal/${dealId}`,
        };
      });

    const topOutboundDeals = Object.entries(outboundDealClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([dealId, clicks]) => {
        const meta = dealMetaMap[dealId] || {};
        return {
          deal_id: Number(dealId),
          clicks,
          description: meta.description ?? null,
          store_name: meta.store_name ?? null,
          category: meta.category ?? null,
          internal_url: `/deal/${dealId}`, // you only want your own URL
        };
      });
// --- NEW TECH STATS ---

// --- TECH STATS ---
const device_types: Record<string, number> = {};
const operating_systems: Record<string, number> = {};
const browsers: Record<string, number> = {};
const screen_sizes: Record<string, number> = {};

(events || []).forEach((r: any) => {
  // Browser (stored in `device`)
  if (r.device) {
    const browser = normalizeBrowser(r.device, r.user_agent);
  browsers[browser] = (browsers[browser] || 0) + 1;
  }

  const meta = r.metadata || {};

  if (meta.device_type) {
    device_types[meta.device_type] =
      (device_types[meta.device_type] || 0) + 1;
  }

  if (meta.os) {
    operating_systems[meta.os] =
      (operating_systems[meta.os] || 0) + 1;
  }

  if (meta.screen) {
    screen_sizes[meta.screen] =
      (screen_sizes[meta.screen] || 0) + 1;
  }
});


    /* ======================================================
       7️⃣ RETURN JSON
    ====================================================== */
    return NextResponse.json({
      total_events: events.length,

      // Visitors
      unique_visitors: Object.keys(visitorsInRange).length,
      new_visitors: newVisitors,
      returning_visitors: returningVisitors,

      // Activity
      total_page_views: totalPageViews,
      total_deal_clicks: totalDealClicks,
      total_outbound_clicks: totalOutboundClicks,

      // Breakdown
      page_counts: pageCounts,
      store_clicks: storeClicks,
      category_clicks: categoryClicks,
      deal_clicks: dealClicks,

      // Deals & CTR (Option A)
      store_deal_counts: storeDealCounts,
      category_deal_counts: categoryDealCounts,
      store_ctr: storeCTR,
      category_ctr: categoryCTR,

      // Top deals
      top_internal_deals: topInternalDeals,
      top_outbound_deals: topOutboundDeals,
      device_types,
  operating_systems,
  browsers,
  screen_sizes,
    });
  } catch (err: any) {
    console.error("Analytics route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
