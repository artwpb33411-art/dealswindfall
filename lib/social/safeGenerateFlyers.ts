import type { SelectedDeal } from "./types";
import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";

const FALLBACK_IMAGE =
  "https://www.dealswindfall.com/dealswindfall-logoA.png";

export async function safeGenerateFlyers(
  deal: SelectedDeal,
  imageUrl: string
) {
  try {
    return {
      portrait: await generateFlyer({ ...deal, image_link: imageUrl }),
      square: await generateFlyerSquare({ ...deal, image_link: imageUrl }),
      story: await generateFlyerStory({ ...deal, image_link: imageUrl }),
    };
  } catch (err) {
    console.error(
      "⚠ Flyer generation failed with product image. Falling back to logo.",
      err
    );

    // Retry with fallback logo
    return {
      portrait: await generateFlyer({
        ...deal,
        image_link: FALLBACK_IMAGE,
      }),
      square: await generateFlyerSquare({
        ...deal,
        image_link: FALLBACK_IMAGE,
      }),
      story: await generateFlyerStory({
        ...deal,
        image_link: FALLBACK_IMAGE,
      }),
    };
  }
}
