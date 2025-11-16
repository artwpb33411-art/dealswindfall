import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { event_name, page, referrer, device, metadata } = body;

    const { error } = await supabaseAdmin.from("analytics").insert({
      event_name,
      page,
      referrer,
      device,
      metadata,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
