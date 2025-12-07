import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { action } = await req.json();

  let message = "";

  if (action === "publish_now") {
    message = "Manual publish triggered";
    // Flag your CRON job to process immediately
    await supabaseAdmin.from("auto_publish_state").update({
      next_run: new Date().toISOString()
    }).eq("id", 1);
  }

  if (action === "skip_next") {
    message = "Next cycle skipped";
    await supabaseAdmin.from("auto_publish_state").update({
      next_run: new Date(Date.now() + 999999999).toISOString()
    }).eq("id", 1);
  }

  if (action === "reset") {
    message = "Scheduler reset";
    await supabaseAdmin.from("auto_publish_state").update({
      last_run: null,
      next_run: null,
      last_count: null
    }).eq("id", 1);
  }

  await supabaseAdmin.from("auto_publish_logs").insert({
    action,
    message,
  });

  return NextResponse.json({ success: true });
}
