import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCaption } from "./captionBuilder";
import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import { publishToX } from "./publishers/x";
import { publishToTelegram } from "./publishers/telegram";
import { publishToFacebook } from "./publishers/facebook";
import { publishToInstagram } from "./publishers/instagram";
import { saveFlyerBufferToSupabase } from "./saveFlyerBuffer";
import { deleteStorageObject } from "./deleteStorageObject";
import path from "path";
const DEFAULT_FLYER_IMAGE = path.resolve(
  process.cwd(),
  "lib/social/assets/logo.png" );


function normalizeDealForFlyer(raw: any) {
  return {
    ...raw,

    // normalize pricing
    price: raw.current_price ?? null,
    old_price: raw.old_price ?? null,
    price_diff: raw.price_diff ?? null,
    percent_diff: raw.percent_diff ?? null,

    // normalize image
    image_link:
      raw.image_link && raw.image_link.trim().length > 0
        ? raw.image_link
        : DEFAULT_FLYER_IMAGE,
  };
}


export async function postDealToSocial({
  deal,
  platforms,
  hashtags = [],
  force = false,
}: {
  deal: any;
  platforms: string[];
  hashtags?: string[];
  force?: boolean;
}) {
  const results: Record<string, any> = {};
  const posted: string[] = [];

  // Generate flyers
  const flyerDeal = normalizeDealForFlyer(deal);

const portrait = await generateFlyer(flyerDeal);
const square = await generateFlyerSquare(flyerDeal);
const story = await generateFlyerStory(flyerDeal);


  const portraitBase64 = portrait.toString("base64");
  const squareBase64 = square.toString("base64");

  const social = buildCaption(deal, hashtags);

  async function tryPost(platform: string, fn: () => Promise<any>) {
    try {
      const res = await fn();
      posted.push(platform);
      results[platform] = res;

      await supabaseAdmin.from("social_post_log").insert({
        deal_id: deal.id,
        platform,
        status: "success",
        forced: force,
      });
    } catch (err: any) {
      results[platform] = { error: String(err) };

      await supabaseAdmin.from("social_post_log").insert({
        deal_id: deal.id,
        platform,
        status: "failed",
        error: String(err),
        forced: force,
      });
    }
  }

  if (platforms.includes("x")) {
    await tryPost("x", () => publishToX(social.short, squareBase64));
  }

  if (platforms.includes("telegram")) {
    await tryPost("telegram", () =>
      publishToTelegram(social.text, squareBase64)
    );
  }

  if (platforms.includes("facebook")) {
    await tryPost("facebook", () =>
      publishToFacebook(social.text, portraitBase64)
    );
  }

 if (platforms.includes("instagram")) {
  const igFile = await saveFlyerBufferToSupabase(portrait, "jpg");

  await tryPost("instagram", () =>
    publishToInstagram(social.text, igFile.publicUrl)
  );

  await deleteStorageObject(igFile.bucket, igFile.path);
}


  return { posted, results };
}
