import { getFlyerBaseImage } from "./image/getFlyerBaseImage";
import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import type { SelectedDeal } from "./types";

export async function safeGenerateFlyers(deal: SelectedDeal) {
  if (typeof (deal as any).price !== "number") {
    throw new Error(
      `❌ RAW DEAL PASSED TO FLYERS. Keys: ${Object.keys(deal)}`
    );
  }
 
  if (!("price" in deal)) {
    throw new Error(
      `RAW DEAL PASSED TO FLYERS. Keys: ${Object.keys(deal)}`
    );
  }
  try {

    if (deal.price === undefined) {
    throw new Error(
      `safeGenerateFlyers received non-normalized deal. Keys: ${Object.keys(deal)}`
    );
  }

    // 1️⃣ Resolve base image ONCE
    const baseImageBuffer = await getFlyerBaseImage(deal.image_link);

    // 2️⃣ Generate all flyers from same base image
    return {
      portrait: await generateFlyer(deal, baseImageBuffer),
      square: await generateFlyerSquare(deal, baseImageBuffer),
      story: await generateFlyerStory(deal, baseImageBuffer),
    };
  } catch (err) {
    console.error("❌ safeGenerateFlyers failed:", err);
    throw err;
  }
}
