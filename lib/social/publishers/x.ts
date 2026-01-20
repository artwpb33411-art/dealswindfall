// Platform entry point
// Delegates to pipeline-based implementation


import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_KEY_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

// Helper: sanitize unicode text (X rejects some characters silently)
function sanitizeForX(text: string) {
  return text
    .replace(/[^\x00-\x7F]+/g, "")         // remove emojis that break X
    .replace(/\s+/g, " ")
    .trim();
}

// Max X media upload is ~5 MB
function ensureImageSize(buffer: Buffer) {
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image too large for X (limit ~5MB). Use square flyer.");
  }
  return buffer;
}


export async function publishToX(caption: string, imageBuffer: Buffer)
 {
  try {
    const text = sanitizeForX(caption);
    const buffer = ensureImageSize(imageBuffer);


    // Upload media
    const mediaId = await client.v1.uploadMedia(buffer, {
      mimeType: "image/png",
    });

    // Post tweet
    const tweet = await client.v2.tweet({
      text,
      media: { media_ids: [mediaId] },
    });

    return tweet;
  } catch (err) {
    console.error("❌ X PUBLISH ERROR:", err);
    return { error: String(err) };
  }
}
