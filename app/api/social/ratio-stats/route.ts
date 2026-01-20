import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Read window size from settings so UI always matches backend behavior
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("auto_publish_settings")
      .select("social_ratio_window_posts")
      .eq("id", 1)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: settingsError?.message || "Missing settings" },
        { status: 500 }
      );
    }

    const windowPosts = Math.max(
      1,
      Number(settings.social_ratio_window_posts ?? 10)
    );

    // Pull last N auto posts (not per-platform complicated; we count log rows)
    // If you want "per run" later, we can group by deal_id+timestamp window.
    const { data: rows, error } = await supabaseAdmin
      .from("social_post_log")
      .select("language, is_affiliate, posted_at")
      .eq("post_mode", "auto")
      .order("posted_at", { ascending: false })
      .limit(windowPosts);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows ?? [];
    const total = list.length;

    const affiliate = list.filter((r) => r.is_affiliate === true).length;
    const nonAffiliate = list.filter((r) => r.is_affiliate === false).length;

    const en = list.filter((r) => (r.language ?? "en") === "en").length;
    const es = list.filter((r) => r.language === "es").length;

    return NextResponse.json({
      windowPosts,
      total,
      affiliate,
      nonAffiliate,
      en,
      es,
      latest_posted_at: list[0]?.posted_at ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
