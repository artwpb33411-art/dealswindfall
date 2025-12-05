import { NextResponse } from "next/server";

import { pickDealFromLastHour } from "@/lib/social/dealSelector";
import { buildCaption } from "@/lib/social/captionBuilder";
import { saveImageToSupabase } from "@/lib/social/saveImage";

import { generateFlyer } from "@/lib/social/flyerGenerator";
import { generateFlyerSquare } from "@/lib/social/flyers/generateFlyerSquare";
import { generateFlyerStory } from "@/lib/social/flyers/generateFlyerStory";

import { publishToX } from "@/lib/social/publishers/x";
import { publishToTelegram } from "@/lib/social/publishers/telegram";
import { publishToFacebook } from "@/lib/social/publishers/facebook";
import { publishToInstagram } from "@/lib/social/publishers/instagram";

export async function POST() {
  try {
    console.log("##############################");
    console.log("### HOURLY AUTPOST STARTED ###");
    console.log("##############################");

    // 1️⃣ PICK DEAL
    const deal = await pickDealFromLastHour();
    if (!deal) {
      console.log("❌ No deal found in last hour.");
      return NextResponse.json({ error: "No deal found" }, { status: 404 });
    }

    console.log("🛒 Deal Selected:", deal.title);

    const caption = buildCaption(deal);

    // 2️⃣ STORE PRODUCT IMAGE TO SUPABASE (PUBLIC URL)
    let finalImage: string | null = null;

    if (deal.image_link) {
      try {
        console.log("⬇ Downloading product image:", deal.image_link);
        finalImage = await saveImageToSupabase(deal.image_link);

        if (!finalImage) {
          console.warn("⚠ Could not store product image, using original URL.");
          finalImage = deal.image_link;
        } else {
          console.log("🟢 Product image stored:", finalImage);
        }
      } catch (err) {
        console.error("❌ Error storing product image:", err);
        finalImage = deal.image_link;
      }
    } else {
      console.warn("⚠ Deal has no image_link, using logo fallback.");
      finalImage = "https://www.dealswindfall.com/dealswindfall-logoA.png";
    }

    // 3️⃣ GENERATE FLYERS (CANVAS)
    console.log("🖨 Generating flyers...");

    const flyerPortrait = await generateFlyer({
      ...deal,
      image_link: finalImage,
    });
    const flyerSquare = await generateFlyerSquare({
      ...deal,
      image_link: finalImage,
    });
    const flyerStory = await generateFlyerStory({
      ...deal,
      image_link: finalImage,
    });

    const portraitBase64 = flyerPortrait.toString("base64");
    const squareBase64 = flyerSquare.toString("base64");
    const storyBase64 = flyerStory.toString("base64");

    // 4️⃣ POST TO SOCIAL NETWORKS (same as before)
    let xResult = null;
    let telegramResult = null;
    let facebookResult = null;
    let instagramResult = null;

    try {
      xResult = await publishToX(caption.text, squareBase64);
      console.log("🐦 Posted to X");
    } catch (err) {
      console.error("❌ X POST ERROR:", err);
    }

    try {
      telegramResult = await publishToTelegram(caption.text, squareBase64);
      console.log("📩 Posted to Telegram");
    } catch (err) {
      console.error("❌ TELEGRAM POST ERROR:", err);
    }

    try {
      facebookResult = await publishToFacebook(caption.text, portraitBase64);
      console.log("📘 Posted to Facebook");
    } catch (err) {
      console.error("❌ FACEBOOK POST ERROR:", err);
    }

    try {
      instagramResult = await publishToInstagram(caption.text, portraitBase64);
      console.log("📸 Posted to Instagram");
    } catch (err) {
      console.error("❌ INSTAGRAM POST ERROR:", err);
    }

    console.log("### AUTOPOST COMPLETE ###");

    return NextResponse.json({
      success: true,
      usedImage: finalImage,
      xResult,
      telegramResult,
      facebookResult,
      instagramResult,
    });
  } catch (err) {
    console.error("❌ HOURLY ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
