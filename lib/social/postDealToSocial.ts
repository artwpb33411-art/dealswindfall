import { buildPlatformCaptions } from "./captionBuilder";
import { postFacebookWithDelayedComment } from "./facebookPostWithDelay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCaption } from "./captionBuilder";
import { generateFlyer } from "./flyerGenerator";
import { generateFlyerSquare } from "./flyers/generateFlyerSquare";
import { generateFlyerStory } from "./flyers/generateFlyerStory";
import { publishToX } from "./publishers/x";
import { publishToTelegram } from "./publishers/telegram";
//import { publishToFacebook } from "./publishers/facebook";
import { publishToInstagram } from "./publishers/instagram";
import { getFlyerBaseImage } from "./image/getFlyerBaseImage";
import { saveFlyerBufferToSupabase } from "./saveFlyerBuffer";
import { deleteStorageObject } from "./deleteStorageObject";



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
 // 1️⃣ Resolve base image ONCE (Sharp + fallback)
const baseImageBuffer = await getFlyerBaseImage(deal.image_link);

// 2️⃣ Generate all flyers from the same image
const portrait = await generateFlyer(deal, baseImageBuffer);
const square = await generateFlyerSquare(deal, baseImageBuffer);
const story = await generateFlyerStory(deal, baseImageBuffer);


 
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
    await tryPost("x", () =>publishToX(social.short, square)
);
  }

  if (platforms.includes("telegram")) {
    await tryPost("telegram", () =>
      publishToTelegram(social.text, square)

    );
  }

 if (platforms.includes("facebook")) {
  await tryPost("facebook", async () => {
    const { captions, url } = buildPlatformCaptions(
      deal,
      hashtags,
      deal.language === "es" ? "es" : "en"
    );
console.log("🚀 FACEBOOK NEW PIPELINE EXECUTED");

    await postFacebookWithDelayedComment({
  pageId: process.env.FACEBOOK_PAGE_ID!,
  pageAccessToken: process.env.FACEBOOK_PAGE_TOKEN!,
  caption: captions.facebook.text,
   flyerImage: portrait,
 // flyerImageUrl: undefined, // 👈 FORCE TEXT POST
  isAffiliate: !!deal.is_affiliate,
  lang: deal.language === "es" ? "es" : "en",
  dealUrl: url,
  affiliateUrl: deal.affiliate_url,
});



    return { ok: true };
  });
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
