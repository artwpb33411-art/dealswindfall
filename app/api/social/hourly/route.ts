import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { generateFlyer } from "@/lib/social/flyerGenerator";
import { generateFlyerSquare } from "@/lib/social/flyers/generateFlyerSquare";
import { generateFlyerStory } from "@/lib/social/flyers/generateFlyerStory";

import { publishToX } from "@/lib/social/publishers/x";
import { publishToTelegram } from "@/lib/social/publishers/telegram";
import { publishToFacebook } from "@/lib/social/publishers/facebook";
import { publishToInstagram } from "@/lib/social/publishers/instagram";

import { saveImageToSupabase } from "@/lib/social/saveImage";

// Weighted pick by percent_diff (bigger discount => higher chance)
function weightedRandom(deals: any[]) {
  const total = deals.reduce(
    (sum, d) => sum + Math.max(d.percent_diff ?? 1, 1),
    0
  );

  let r = Math.random() * total;
  for (const d of deals) {
    const w = Math.max(d.percent_diff ?? 1, 1);
    if (r < w) return d;
    r -= w;
  }
  return deals[0];
}

export async function POST(req: Request) {
  const CRON_SECRET =
    process.env.CRON_SECRET ?? "9f3e7c29f8a94e4bb9dae34234591e95";

  const isCronCall = req.headers.get("x-cron-secret") === CRON_SECRET;
  const force = !isCronCall; // Option A: manual calls always force run

  const now = new Date();

  try {
    console.log("###############################");
    console.log("### SOCIAL AUTOPOST STARTED ###");
    console.log("### isCron:", isCronCall, "force:", force, "###");
    console.log("###############################");

    // 1️⃣ Load settings / state / platforms
    const [
      { data: settings, error: settingsError },
      { data: state, error: stateError },
      { data: platforms, error: platformsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("auto_publish_settings")
        .select("*")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("auto_publish_state")
        .select("*")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("auto_publish_platforms")
        .select("x, telegram, facebook, instagram, reddit")
        .eq("id", 1)
        .single(),
    ]);

    if (settingsError || stateError || platformsError || !settings || !state) {
      console.error("❌ Missing settings/state/platforms", {
        settingsError,
        stateError,
        platformsError,
      });

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_error",
        deals_published: 0,
        message: "Missing settings/state/platforms",
      });

      return NextResponse.json(
        { error: "Scheduler configuration missing" },
        { status: 500 }
      );
    }

    // 2️⃣ Check if social auto-posting is enabled
    if (!settings.social_enabled) {
      console.log("⛔ Social autopost disabled.");

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: "Social autopost disabled.",
      });

      return NextResponse.json({ skipped: true, reason: "disabled" });
    }

    // 3️⃣ Active platforms
    const activePlatforms = Object.entries(platforms)
      .filter(([, v]) => !!v)
      .map(([k]) => k);

    if (activePlatforms.length === 0) {
      console.log("⛔ No platforms enabled, skipping.");

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: "No social platforms enabled.",
      });

      return NextResponse.json({
        skipped: true,
        reason: "no platforms enabled",
      });
    }

    // 4️⃣ Scheduler timing – only for CRON
    const intervalMinutes: number =
      settings.social_interval_minutes ?? 60; // default 1h

    const nextRun =
      state.social_next_run != null
        ? new Date(state.social_next_run)
        : null;

    if (isCronCall && nextRun && now < nextRun) {
      console.log(
        `⏳ Not time yet. Next social run at: ${nextRun.toISOString()}`
      );

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: `Skipped by scheduler. Now=${now.toISOString()}, nextRun=${nextRun.toISOString()}`,
      });

      return NextResponse.json({ skipped: true, nextRun });
    }

    // 5️⃣ Allowed stores
    const allowedStores: string[] =
      settings.allowed_stores?.length > 0
        ? settings.allowed_stores
        : ["Amazon", "Walmart"];

    console.log("Allowed stores for social:", allowedStores);

    // 6️⃣ Fetch candidate deals (last 12 hours)
    const since = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();

    const { data: deals, error: dealsError } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("status", "Published")
      .eq("exclude_from_auto", false)
      .in("store_name", allowedStores)
      .gte("published_at", since)
      .order("published_at", { ascending: false })
      .limit(100);

    if (dealsError) throw dealsError;

    if (!deals || deals.length === 0) {
      console.log("❌ No deals available for social posting.");

      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: now.toISOString(),
        action: "social_skip",
        deals_published: 0,
        message: "No eligible deals found.",
      });

      // still set next run so it doesn't hammer forever
      const nextSocialRun = new Date(
        now.getTime() + intervalMinutes * 60_000
      ).toISOString();

      await supabaseAdmin
        .from("auto_publish_state")
        .update({
          social_last_run: now.toISOString(),
          social_last_count: 0,
          social_last_deal: null,
          social_next_run: nextSocialRun,
          updated_at: now.toISOString(),
        })
        .eq("id", 1);

      return NextResponse.json({ skipped: true, reason: "no deals" });
    }

    // 7️⃣ Pick a deal
    const deal = weightedRandom(deals);
    // 🔧 Normalize deal fields for flyer
const normalizedDeal = {
  ...deal,
  price: deal.current_price ? Number(deal.current_price) : null,
  old_price: deal.old_price ? Number(deal.old_price) : null,
  percent_diff: deal.percent_diff ? Number(deal.percent_diff) : null,
};


    console.log(
      "🎯 Selected deal:",
      deal.description || deal.notes || deal.slug,
      "| Discount:",
      deal.percent_diff
    );

    // 8️⃣ Prepare image
    let finalImage: string | null = deal.image_link;

    if (finalImage) {
      try {
        finalImage = await saveImageToSupabase(finalImage);
      } catch (err) {
        console.error("⚠ Error storing image. Using original URL.", err);
      }
    }

    if (!finalImage) {
      finalImage = "https://www.dealswindfall.com/dealswindfall-logoA.png";
    }

    // 9️⃣ Generate flyers
    console.log("🖨 Generating flyers...");

    const flyerPortrait = await generateFlyer({
       ...normalizedDeal,
      image_link: finalImage,
    });
    const flyerSquare = await generateFlyerSquare({
       ...normalizedDeal,
      image_link: finalImage,
    });
    const flyerStory = await generateFlyerStory({
       ...normalizedDeal,
      image_link: finalImage,
    });

    const portraitBase64 = flyerPortrait.toString("base64");
    const squareBase64 = flyerSquare.toString("base64");
    const storyBase64 = flyerStory.toString("base64"); // for future use

    // 🔟 Post to platforms
    const results: Record<string, any> = {};
    const platformsPosted: string[] = [];

    const caption =
      deal.description ??
      deal.notes ??
      `Hot deal from ${deal.store_name || "DealsWindfall"}`;

    async function tryPost(name: string, fn: () => Promise<any>) {
      try {
        const res = await fn();
        console.log(`✅ Posted to ${name}`);
        results[name] = res;
        platformsPosted.push(name);
      } catch (err) {
        console.error(`❌ ${name.toUpperCase()} ERROR:`, err);
        results[name] = { error: String(err) };
      }
    }

    if (platforms.x) {
      await tryPost("x", () => publishToX(caption, squareBase64));
    }

    if (platforms.telegram) {
      await tryPost("telegram", () =>
        publishToTelegram(caption, squareBase64)
      );
    }

    if (platforms.facebook) {
      await tryPost("facebook", () =>
        publishToFacebook(caption, portraitBase64)
      );
    }

    if (platforms.instagram) {
      await tryPost("instagram", () =>
        publishToInstagram(caption, portraitBase64)
      );
    }

    // 1️⃣1️⃣ Update scheduler state (both cron + manual)
    const nextSocialRun = new Date(
      now.getTime() + intervalMinutes * 60_000
    ).toISOString();

    await supabaseAdmin
      .from("auto_publish_state")
      .update({
        social_last_run: now.toISOString(),
        social_last_count: platformsPosted.length > 0 ? 1 : 0,
        social_last_deal: deal.id,
        social_next_run: nextSocialRun,
        updated_at: now.toISOString(),
      })
      .eq("id", 1);

    // 1️⃣2️⃣ Log entry in your existing schema
    await supabaseAdmin.from("auto_publish_logs").insert({
      run_time: now.toISOString(),
      action: "social",
      deals_published: platformsPosted.length > 0 ? 1 : 0,
      message:
        platformsPosted.length > 0
          ? `Posted deal ID ${deal.id} to: ${platformsPosted.join(", ")} (forced=${force}, isCron=${isCronCall})`
          : `Attempted social autopost but no platforms succeeded. (forced=${force}, isCron=${isCronCall})`,
    });

    console.log("### SOCIAL AUTOPOST COMPLETE ###");

    return NextResponse.json({
      success: true,
      deal_id: deal.id,
      platforms: platformsPosted,
      nextRun: nextSocialRun,
      results,
      forced: force,
      isCron: isCronCall,
    });
  } catch (err) {
    console.error("❌ SOCIAL AUTOPOST ERROR:", err);

    try {
      await supabaseAdmin.from("auto_publish_logs").insert({
        run_time: new Date().toISOString(),
        action: "social_error",
        deals_published: 0,
        message: String(err),
      });
    } catch (_) {
      // ignore logging failure
    }

    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
