import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* --------------------------------------------- */
/* 🟢 GET – Returns the current settings         */
/* --------------------------------------------- */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_settings")
    .select("*")
    .single();

  if (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/* --------------------------------------------- */
/* 🔵 POST – Updates the settings                */
/* --------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { enabled, deals_per_cycle, interval_minutes } = body;

    const { data, error } = await supabaseAdmin
      .from("auto_publish_settings")
      .update({
        enabled,
        deals_per_cycle,
        interval_minutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, settings: data });
  } catch (err: any) {
    console.error("POST settings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
