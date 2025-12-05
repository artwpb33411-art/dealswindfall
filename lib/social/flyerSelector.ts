import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import type { SelectedDeal } from "./types";

export async function generateFlyersForPlatforms(deal: SelectedDeal) {
  console.log("🎨 Generating flyers for all platforms...");

  const portrait = await generateFlyer(deal);          // FB Feed, IG Feed
  const square = await generateFlyerSquare(deal);      // Twitter, Telegram
  const story = await generateFlyerStory(deal);        // Instagram Story

  return {
    portrait,
    square,
    story,
  };
}
