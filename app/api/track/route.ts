import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read body FIRST
    const body = await req.json();

    // 2️⃣ THEN destructure
    const {
      event_name,
      event_type,
      page,
      referrer,
      user_agent,
      utm_source,
      utm_medium,
      utm_campaign,
      ip_address,
    } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: "Missing event_type" },
        { status: 400 }
      );
    }

    // ===============================
    // EXISTING analytics insert (KEEP)
    // ===============================
    const { data, error } = await supabaseAdmin
      .from("analytics")
      .insert({
        event_type,
        page: page || null,
        referrer: referrer || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        user_agent: user_agent || null,
        ip_address: ip_address || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase analytics insert error:", error);
      console.log("TRACK BODY:", body);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error("TRACK API ERROR:", e);
    return NextResponse.json(
      { error: e.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
