import {
  publishFacebookPost,
  publishFacebookComment,
} from "./facebookPublisher";

import { buildFacebookComment } from "./facebookCommentBuilder";



function randomDelayMs(minSec = 30, maxSec = 90) {
  const sec =
    Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  return sec * 1000;
}
//console.log("🚀 FACEBOOK NEW PIPELINE EXECUTED");

// real code in here
export async function postFacebookWithDelayedComment({
  pageId,
  pageAccessToken,
  caption,
  flyerImage,              // ✅ add this
  isAffiliate,
  lang,
  dealUrl,
  affiliateUrl,
}: {
  pageId: string;
  pageAccessToken: string;
  caption: string;
  flyerImage?: Buffer;     // ✅ Buffer, optional
  isAffiliate: boolean;
  lang: "en" | "es";
  dealUrl: string;
  affiliateUrl?: string;
})
{
  // 🔑 SANITY CHECK — ADD THIS HERE
  console.log(
    "🔑 FB TOKEN PREFIX:",
    pageAccessToken.slice(0, 8),
    "LEN:",
    pageAccessToken.length
  );



 {
  // 1️⃣ Publish post
  console.log("📘 FB CAPTION:", caption);

  const { postId } = await publishFacebookPost({
    pageId,
    pageAccessToken,
    message: caption,
  //  imageUrl: flyerImageUrl,
  });


  // 2️⃣ Delay
  const delay = randomDelayMs(30, 90);

console.log(`⏳ Waiting ${delay / 1000}s before posting comment`);

await new Promise(res => setTimeout(res, delay));


console.log("🆔 FB POST CREATED:", postId);

  // 3️⃣ Build comment
  const comment = await buildFacebookComment({
    isAffiliate,
    lang,
    dealUrl,
    affiliateUrl,
  });

  // 4️⃣ Publish comment
  await publishFacebookComment(
    postId,
    comment,
    pageAccessToken
  ); 
}
}
