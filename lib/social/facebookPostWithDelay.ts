import {
  publishFacebookPost,
  publishFacebookComment,
} from "./facebookPublisher";

import {
  buildFacebookEngagementComment,
  buildFacebookLinkComment,
} from "./facebookCommentBuilder";

function randomDelayMs(minSec: number, maxSec: number) {
  const sec = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  return sec * 1000;
}

export async function postFacebookWithDelayedComment({
  pageId,
  pageAccessToken,
  caption,
  flyerImage,
  isAffiliate, // kept but not used in comments now
  lang,
  dealUrl,
}: {
  pageId: string;
  pageAccessToken: string;
  caption: string;
  flyerImage?: Buffer;
  isAffiliate: boolean;
  lang: "en" | "es";
  dealUrl: string;
}) {
  console.log("📘 FB CAPTION:", caption);

  const { postId } = await publishFacebookPost({
    pageId,
    pageAccessToken,
    message: caption,
    imageBuffer: flyerImage,
  });

  console.log("🆔 FB POST CREATED:", postId);

  // 1) Stage 1 comment (no link) after 2–3 minutes
  const delay1 = randomDelayMs(120, 180);
  console.log(`⏳ Waiting ${delay1 / 1000}s before posting engagement comment`);
  await new Promise(res => setTimeout(res, delay1));

  const engagementComment = await buildFacebookEngagementComment({
    lang,
    dealUrl,
    // use deal id from dealUrl if you want deterministic selection (see builder below)
  });

  await publishFacebookComment(postId, engagementComment, pageAccessToken);

  // 2) Stage 2 comment (WITH DealsWindfall link) after another 2–3 minutes
  const delay2 = randomDelayMs(120, 180);
  console.log(`⏳ Waiting ${delay2 / 1000}s before posting link comment`);
  await new Promise(res => setTimeout(res, delay2));

  const linkComment = await buildFacebookLinkComment({
    lang,
    dealUrl, // ALWAYS your website URL now
  });

  await publishFacebookComment(postId, linkComment, pageAccessToken);
}
