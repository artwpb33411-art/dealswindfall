import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { estDateRangeToUtc, defaultEstRange } from "@/lib/timezone";

/* ---------------------------------------------------
   Date range helper (EST → UTC)
--------------------------------------------------- */
function parseDateRange(sp: URLSearchParams) {
  const fromParam = sp.get("from");
  const toParam = sp.get("to");

  // EST calendar dates
  const { from, to } =
    fromParam && toParam ? { from: fromParam, to: toParam } : defaultEstRange(7);

  // Convert EST → UTC for DB filtering
  const { fromUtc, toUtc } = estDateRangeToUtc(from, to);

  return {
    fromEst: from,
    toEst: to,
    fromUtc,
    toUtc,
  };
}

/* ---------------------------------------------------
   GET
--------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);

    const { fromEst, toEst, fromUtc, toUtc } = parseDateRange(searchParams);

    /* ---------------------------------------------------
       1. Pull deal page views (UTC-filtered)
    --------------------------------------------------- */
    const { data: rows, error } = await supabaseAdmin
      .from("deal_page_views")
      .select("deal_id, created_at")
      .gte("created_at", fromUtc)
      .lte("created_at", toUtc);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        range: { from: fromEst, to: toEst, timezone: "America/New_York" },
        items: [],
      });
    }

    /* ---------------------------------------------------
       2. Aggregate by deal_id
    --------------------------------------------------- */
    const map = new Map<number, { views: number; last: string }>();

    for (const r of rows) {
      if (!r.deal_id) continue;

      const existing = map.get(r.deal_id);
      if (!existing) {
        map.set(r.deal_id, { views: 1, last: r.created_at });
      } else {
        existing.views += 1;
        if (r.created_at > existing.last) {
          existing.last = r.created_at;
        }
      }
    }

    const top = Array.from(map.entries())
      .map(([deal_id, v]) => ({ deal_id, ...v }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    const dealIds = top.map((x) => x.deal_id);

    /* ---------------------------------------------------
       3. Join deals table
    --------------------------------------------------- */
    const { data: deals, error: dealsErr } = await supabaseAdmin
      .from("deals")
      .select("id, description, slug, store_name")
      .in("id", dealIds);

    if (dealsErr) {
      return NextResponse.json({ error: dealsErr.message }, { status: 400 });
    }

    const dealMap = new Map(deals?.map((d) => [d.id, d]) || []);

    /* ---------------------------------------------------
       4. Final response
    --------------------------------------------------- */
    const items = top.map((t) => {
      const d = dealMap.get(t.deal_id);
      return {
        deal_id: t.deal_id,
        description: d?.description || null,
        slug: d?.slug || null,
        store_name: d?.store_name || "-",
        views: t.views,
        last_viewed_at: t.last,
      };
    });

    return NextResponse.json({
      range: { from: fromEst, to: toEst, timezone: "America/New_York" },
      items,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
