import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import { getFlyerBaseImage } from "./image/getFlyerBaseImage";
import type { SelectedDeal } from "./types";

export async function generateFlyersForPlatforms(deal: SelectedDeal) {
  console.log("🎨 Generating flyers for all platforms...");

  // 🔑 Normalize product image ONCE (Sharp + fallback)
  const baseImage = await getFlyerBaseImage(deal.image_link);

  // 🖼 Generate flyers using the same base image
  const portrait = await generateFlyer(deal, baseImage);       // FB Feed, IG Feed
  const square   = await generateFlyerSquare(deal, baseImage); // Twitter, Telegram
  const story    = await generateFlyerStory(deal, baseImage);  // Instagram Story

  return {
    portrait,
    square,
    story,
  };
}
