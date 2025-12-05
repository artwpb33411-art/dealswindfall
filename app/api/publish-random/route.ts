import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { count = 5 } = await req.json().catch(() => ({ count: 5 }));

    // 1️⃣ Fetch all DRAFT deals eligible for auto-publish
    const { data: drafts, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("status", "Draft")
      .eq("exclude_from_auto", false);

    if (error) throw error;

    if (!drafts || drafts.length === 0) {
      return NextResponse.json(
        { ok: true, message: "No eligible draft deals found.", published: [] },
        { status: 200 }
      );
    }

    // 2️⃣ Shuffle and pick X random deals
    const shuffled = drafts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const ids = selected.map((d) => d.id);

    // 3️⃣ Publish selected deals
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("deals")
      .update({
        status: "Published",
        published_at: new Date().toISOString(),
      })
      .in("id", ids)
      .select();

    if (updateErr) throw updateErr;

    return NextResponse.json(
      {
        ok: true,
        publishedCount: updated.length,
        publishedDeals: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("AUTO-PUBLISH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error during auto publish." },
      { status: 500 }
    );
  }
}
