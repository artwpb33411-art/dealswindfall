import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { deal_id, path, referrer, user_agent } = await req.json();

    if (!deal_id || !path) {
      return NextResponse.json(
        { error: "Missing deal_id or path" },
        { status: 400 }
      );
    }

    await supabaseAdmin.from("deal_page_views").insert({
      deal_id,
      path,
      referrer: referrer ?? null,
      user_agent: user_agent ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Deal view tracking error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
