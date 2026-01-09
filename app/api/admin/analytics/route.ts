import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { estDateRangeToUtc } from "@/lib/timezone";

export const dynamic = "force-dynamic";
export const revalidate = 0;




function isValidScreenSize(screen: string) {
  const [w, h] = screen.split("x").map(Number);
  if (!w || !h) return false;
  if (w < 320 || h < 320) return false;
  if (w > 4000 || h > 4000) return false;
  if (w === h && w >= 1000) return false;
  if (w === 800 && h === 600) return false;
  return true;
}


/* -------------------------------------------------- */
/* Route                                              */
/* -------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limit = Number(searchParams.get("limit") || 20);

    if (!start || !end) {
      return NextResponse.json(
        { error: "Missing start or end date" },
        { status: 400 }
      );
    }

    const { fromUtc, toUtc } = estDateRangeToUtc(start, end);

    /* ==================================================
       SUMMARY METRICS (SQL-FIRST, GUARANTEED MONOTONIC)
       ================================================== */

// STORE CTR STATS
const { data: storeStats, error: storeErr } =
  await supabaseAdmin.rpc("store_ctr_stats", {
    from_ts: fromUtc,
    to_ts: toUtc,
  });

if (storeErr) throw storeErr;

const { data: categoryCtrStats, error: catErr } =
  await supabaseAdmin.rpc("category_ctr_stats", {
    from_ts: fromUtc,
    to_ts: toUtc,
  });

if (catErr) throw catErr;

 
const { data: visitorsCount, error } =
  await supabaseAdmin.rpc("count_unique_visitors", {
    from_ts: fromUtc,
    to_ts: toUtc,
  });

if (error) throw error;

const { data: category_deal_views, error: cdvErr } =
  await supabaseAdmin.rpc("category_deal_view_stats", {
    from_ts: fromUtc,
    to_ts: toUtc,
  });

if (cdvErr) throw cdvErr;


    // 2️⃣ Page Views
    const { count: pageViewsCount, error: pvErr } = await supabaseAdmin
     .from("analytics_human")
  .select("id", { count: "exact", head: true })
  .eq("event_name", "page_view")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");

    if (pvErr) throw pvErr;

    // 3️⃣ Outbound Clicks (PER-DEAL UNIQUE)
    const { data: outboundPairs, error: obErr } = await supabaseAdmin
     .from("analytics_human")
  .select("visitor_id, deal_id")
  .eq("event_name", "deal_outbound_click")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("visitor_id", "is", null)
  .not("deal_id", "is", null)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");

    if (obErr) throw obErr;

    const outboundUnique = new Set(
      (outboundPairs || []).map(
        (r) => `${r.visitor_id}:${r.deal_id}`
      )
    );

    // 4️⃣ Deal Clicks (intentional deal page views)
    const { count: dealClicksCount, error: dcErr } = await supabaseAdmin
      .from("deal_page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", fromUtc)
      .lte("created_at", toUtc);

    if (dcErr) throw dcErr;

    /* ==================================================
       TOP OUTBOUND CLICKED DEALS (SQL JOIN — FINAL FIX)
       ================================================== */

    const { data: topOutbound, error: topErr } = await supabaseAdmin
      .rpc("top_outbound_deals", {
        from_utc: fromUtc,
        to_utc: toUtc,
        row_limit: limit,
      });

    if (topErr) throw topErr;

    /* ==================================================
       TOP VIEWED DEALS (EXISTING LOGIC — WORKING)
       ================================================== */

    const { data: dealViews, error: dvErr } = await supabaseAdmin
      .from("deal_page_views")
      .select("deal_id")
      .gte("created_at", fromUtc)
      .lte("created_at", toUtc);

    if (dvErr) throw dvErr;

    const dealViewCounts: Record<string, number> = {};
    for (const r of dealViews || []) {
      const key = String(r.deal_id);
      dealViewCounts[key] = (dealViewCounts[key] || 0) + 1;
    }

    const dealIds = Object.keys(dealViewCounts).map(Number);

    const dealMeta: Record<string, any> = {};
    if (dealIds.length > 0) {
      const { data: deals, error: dErr } = await supabaseAdmin
        .from("deals")
        .select("id, description, slug, store_name, category")
        .in("id", dealIds);

      if (dErr) throw dErr;

      for (const d of deals || []) {
        dealMeta[String(d.id)] = d;
      }
    }

    const top_viewed_deals = Object.entries(dealViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, views]) => {
        const m = dealMeta[id] || {};
        return {
          deal_id: Number(id),
          views,
          description: m.description ?? null,
          store_name: m.store_name ?? null,
          category: m.category ?? null,
          internal_url: m.slug
            ? `/deals/${id}-${m.slug}`
            : `/deals/${id}`,
        };
      });

const { data: deviceTypeRows } = await supabaseAdmin
  .from("analytics_human")
  .select("metadata")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("metadata->>device_type", "is", null)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");



const device_types: Record<string, number> = {};
for (const r of deviceTypeRows || []) {
  const type = r.metadata?.device_type;
  if (!type) continue;
  device_types[type] = (device_types[type] || 0) + 1;
}


const { data: osRows } = await supabaseAdmin
  .from("analytics_human")
  .select("metadata")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("metadata->>os", "is", null)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");

const operating_systems: Record<string, number> = {};
for (const r of osRows || []) {
  const os = r.metadata?.os;
  if (!os) continue;
  operating_systems[os] = (operating_systems[os] || 0) + 1;
}


const { data: browserRows } = await supabaseAdmin
  .from("analytics_human")
  .select("user_agent")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("user_agent", "is", null)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");


const browsers: Record<string, number> = {};
for (const r of browserRows || []) {
  const ua = r.user_agent.toLowerCase();
  let b = "Other";
  if (ua.includes("edg")) b = "Edge";
  else if (ua.includes("chrome") && !ua.includes("edg")) b = "Chrome";
  else if (ua.includes("firefox")) b = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) b = "Safari";

  browsers[b] = (browsers[b] || 0) + 1;
}


const { data: screenRows } = await supabaseAdmin
  .from("analytics_human")
  .select("metadata")
  .gte("created_at", fromUtc)
  .lte("created_at", toUtc)
  .not("metadata->>screen", "is", null)
  .not("page", "like", "/admin%")
  .not("page", "like", "/api%")
  .not("user_agent", "ilike", "%bot%");

const screen_sizes: Record<string, number> = {};

for (const r of screenRows || []) {
  const s = r.metadata?.screen;
  if (!s) continue;
  if (!isValidScreenSize(s)) continue;

  screen_sizes[s] = (screen_sizes[s] || 0) + 1;
}




    /* ==================================================
       RESPONSE
       ================================================== */

    return NextResponse.json({
      range: { start: fromUtc, end: toUtc },

      unique_visitors: visitorsCount ?? 0,
      total_page_views: pageViewsCount ?? 0,
      total_deal_clicks: dealClicksCount ?? 0,
      total_outbound_clicks: outboundUnique.size,
category_ctr_stats: categoryCtrStats ?? [],

      top_viewed_deals,
      top_outbound_deals: topOutbound ?? [],
       store_ctr_stats: storeStats ?? [],
       device_types,
  operating_systems,
  browsers,
  screen_sizes,
  category_deal_views,
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
