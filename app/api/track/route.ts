import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

const { event_type, deal_id, page, user_agent, ip_address, referrer, utm_source, utm_medium, utm_campaign } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: "Missing event_type" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("analytics")
     .insert({
  event_type,
  deal_id: deal_id || null,
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
      console.error("Supabase insert error:", error);
	   console.error("SUPABASE ERROR:", error);  // <-- ADD THIS
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
