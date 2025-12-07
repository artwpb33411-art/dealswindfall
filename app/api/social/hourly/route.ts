import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { pickDealForSocial } from "@/lib/social/dealSelector";

import { generateFlyer } from "@/lib/social/flyerGenerator";
import { generateFlyerSquare } from "@/lib/social/flyers/generateFlyerSquare";
import { generateFlyerStory } from "@/lib/social/flyers/generateFlyerStory";

import { publishToX } from "@/lib/social/publishers/x";
import { publishToTelegram } from "@/lib/social/publishers/telegram";
import { publishToFacebook } from "@/lib/social/publishers/facebook";
import { publishToInstagram } from "@/lib/social/publishers/instagram";

import { saveImageToSupabase } from "@/lib/social/saveImage";

export async function POST() {
  try {
    console.log("###############################");
    console.log("### SOCIAL AUTOPOST STARTED ###");
    console.log("###############################");

    // 1️⃣ LOAD SETTINGS & PLATFORM CONFIG
    const [{ data: settings }, { data: platforms }] = await Promise.all([
      supabaseAdmin
        .from("auto_publish_settings")
        .select("*")
        .eq("id", 1)
        .single(),

      supabaseAdmin
        .from("auto_publish_platforms")
        .select("*")
        .eq("id", 1)
        .single(),
    ]);

    if (!settings) {
      console.log("❌ No settings found.");
      return NextResponse.json({ error: "No settings" }, { status: 500 });
    }

    // 2️⃣ VALIDATE SOCIAL ENABLED
    if (!settings.social_enabled) {
      console.log("⛔ Social autopost disabled, exiting.");
      return NextResponse.json({ skipped: true, reason: "disabled" });
    }

    // 3️⃣ VALIDATE ANY PLATFORM ENABLED
    const platformList = {
      x: platforms?.x,
      telegram: platforms?.telegram,
      facebook: platforms?.facebook,
      instagram: platforms?.instagram,
    };

    if (!Object.values(platformList).some(Boolean)) {
      console.log("⛔ No platforms enabled — skipping.");
      return NextResponse.json({ skipped: true, reason: "no platforms enabled" });
    }

    // 4️⃣ PICK DEAL (Using new dealSelector with allowed stores + fallback)
    const deal = await pickDealForSocial();

    if (!deal) {
      console.log("❌ No deals available for social posting.");
      return NextResponse.json({ skipped: true, reason: "no deals found" });
    }

    console.log("🎯 Selected deal:", deal.title);

    // 5️⃣ IMAGE VALIDATION & STORAGE
    let finalImage = deal.image_link;

    if (finalImage) {
      try {
        finalImage = await saveImageToSupabase(finalImage);
      } catch (err) {
        console.error("⚠ Image store failed. Using original.", err);
      }
    }

    if (!finalImage) {
      finalImage =
        "https://www.dealswindfall.com/dealswindfall-logoA.png";
    }

    // 6️⃣ GENERATE FLYERS
    console.log("🖨 Generating flyers...");

    const flyerPortrait = await generateFlyer({ ...deal, image_link: finalImage });
    const flyerSquare = await generateFlyerSquare({ ...deal, image_link: finalImage });
    const flyerStory = await generateFlyerStory({ ...deal, image_link: finalImage });

    const portraitBase64 = flyerPortrait.toString("base64");
    const squareBase64 = flyerSquare.toString("base64");
    const storyBase64 = flyerStory.toString("base64");

    // 7️⃣ POST TO ENABLED PLATFORMS
    let results: any = {};

    async function tryPost(platform: string, fn: () => Promise<any>) {
      try {
        const res = await fn();
        console.log(`✅ Posted to ${platform}`);
        results[platform] = res;
      } catch (err) {
        console.error(`❌ ${platform.toUpperCase()} ERROR:`, err);
        results[platform] = { error: String(err) };
      }
    }

    if (platforms.x) {
      await tryPost("x", () => publishToX(deal.title, squareBase64));
    }

    if (platforms.telegram) {
      await tryPost("telegram", () =>
        publishToTelegram(deal.title, squareBase64)
      );
    }

    if (platforms.facebook) {
      await tryPost("facebook", () =>
        publishToFacebook(deal.title, portraitBase64)
      );
    }

    if (platforms.instagram) {
      await tryPost("instagram", () =>
        publishToInstagram(deal.title, portraitBase64)
      );
    }

    // 8️⃣ LOG RESULTS
    await supabaseAdmin.from("auto_publish_logs").insert({
      action: "social_autopost",
      message: `Posted deal ID ${deal.id} to social platforms`,
    });

    console.log("### SOCIAL AUTOPOST COMPLETE ###");

    return NextResponse.json({
      success: true,
      deal,
      results,
    });
  } catch (err) {
    console.error("❌ SOCIAL AUTOPOST ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
