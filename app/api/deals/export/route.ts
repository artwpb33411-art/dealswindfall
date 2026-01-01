import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { startDate, endDate, scope } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing date range" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("deals")
      .select("*");

    if (scope === "published") {
      query = query
        .gte("published_at", `${startDate}T00:00:00`)
        .lte("published_at", `${endDate}T23:59:59`)
        .order("published_at", { ascending: false });
    } else {
      query = query
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .order("created_at", { ascending: false });
    }

    // ✅ Declare ONCE
    const result = await query;

    if (result.error) throw result.error;

    const BASE_URL = "https://www.dealswindfall.com";

    const enrichedDeals = (result.data || []).map((deal) => ({
      ...deal,
      url_en: `${BASE_URL}/deals/${deal.id}-${deal.slug}`,
      url_es: deal.slug_es
        ? `${BASE_URL}/es/deals/${deal.id}-${deal.slug_es}`
        : null,
      url_id: `${BASE_URL}/?deal=${deal.id}`,
    }));

    return NextResponse.json({ ok: true, deals: enrichedDeals });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
