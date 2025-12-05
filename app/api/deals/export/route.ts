import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .gte("published_at", startDate + "T00:00:00")
      .lte("published_at", endDate + "T23:59:59")
      .order("published_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, deals: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
