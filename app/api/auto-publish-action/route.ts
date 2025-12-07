import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { action } = await req.json();

  let message = "";
  const now = new Date();

  if (action === "publish_now") {
    message = "Manual SOCIAL publish triggered";

    // 🚀 TRIGGER SOCIAL autopost immediately (IMPORTANT FIX)
    await supabaseAdmin.from("auto_publish_state").update({
      social_next_run: now.toISOString(),   // <-- FIXED
      updated_at: now.toISOString()
    }).eq("id", 1);
  }

  if (action === "skip_next") {
    message = "Next SOCIAL cycle skipped";

    await supabaseAdmin.from("auto_publish_state").update({
      social_next_run: new Date(Date.now() + 999999999).toISOString(),
      updated_at: now.toISOString()
    }).eq("id", 1);
  }

  if (action === "reset") {
    message = "SOCIAL scheduler reset";

    await supabaseAdmin.from("auto_publish_state").update({
      social_last_run: null,
      social_next_run: null,
      social_last_count: null,
      social_last_deal: null,
      updated_at: now.toISOString()
    }).eq("id", 1);
  }

  await supabaseAdmin.from("auto_publish_logs").insert({
    action,
    message,
  });

  return NextResponse.json({ success: true });
}
