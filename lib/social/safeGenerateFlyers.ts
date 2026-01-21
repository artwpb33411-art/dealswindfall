import { getFlyerBaseImage } from "./image/getFlyerBaseImage";
import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import type { SelectedDeal } from "./types";
import type { FlyerLang } from "./flyerText";
import { normalizeDeal } from "./normalizeDeal";

export async function safeGenerateFlyers(
  rawDeal: any,
  lang: FlyerLang
) {
  const deal = normalizeDeal(rawDeal); // 🔑 ENFORCED HERE

  if (typeof deal.price !== "number") {
    throw new Error(
      `safeGenerateFlyers received invalid deal. Keys: ${Object.keys(deal)}`
    );
  }

  const baseImageBuffer = await getFlyerBaseImage(deal.image_link);

  return {
    portrait: await generateFlyer(deal, baseImageBuffer, lang),
    square: await generateFlyerSquare(deal, baseImageBuffer, lang),
    story: await generateFlyerStory(deal, baseImageBuffer, lang),
  };
}
