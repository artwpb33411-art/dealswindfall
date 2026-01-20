// Platform entry point
// Delegates to pipeline-based implementation


async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for Instagram to finish processing the media container.
 */
async function waitForInstagramProcessing(
  igUserId: string,
  creationId: string,
  token: string,
  maxAttempts = 10,
  delayMs = 2000
) {
  const base = `https://graph.facebook.com/v19.0/${creationId}`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(
      `${base}?fields=status_code&access_token=${encodeURIComponent(token)}`
    );
    const json: any = await res.json();

    if (!res.ok) {
      console.error("❌ IG status check error:", json);
      throw new Error("Instagram status check failed");
    }

    const status = json.status_code;

    if (status === "FINISHED") {
      return;
    }

    if (status === "ERROR") {
      console.error("❌ IG media processing error:", json);
      throw new Error("Instagram media processing failed");
    }

    // IN_PROGRESS or unknown status → wait and retry
    console.log(
      `⏳ IG processing status: ${status} (attempt ${attempt}/${maxAttempts})`
    );
    await sleep(delayMs);
  }

  throw new Error("Instagram media processing did not finish in time");
}

/**
 * Publish to Instagram using a public JPEG URL.
 * @param caption   The text caption
 * @param imageUrl  Public HTTPS URL to a JPEG flyer
 */
export async function publishToInstagram(
  caption: string,
  imageUrl: string
)
: Promise<any> {
  try {
    const IG_ID = process.env.INSTAGRAM_BUSINESS_ID!;
    const TOKEN = process.env.INSTAGRAM_LONG_LIVED_TOKEN!;

    if (!IG_ID || !TOKEN) {
      console.error("Instagram config error: IG_ID or TOKEN missing");
      return { error: "Missing Instagram credentials" };
    }

    // 1️⃣ Create media container
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${IG_ID}/media`,
      {
        method: "POST",
        body: new URLSearchParams({
          access_token: TOKEN,
          caption,
          image_url: imageUrl, // ✅ this is the key
        }),
      }
    );

    const createJson: any = await createRes.json();

    if (!createRes.ok || !createJson.id) {
      console.error("❌ INSTAGRAM MEDIA CREATE ERROR:", createJson);
      return { error: createJson };
    }

    const creationId = createJson.id as string;
    console.log("✅ IG media container created:", creationId);

    // 2️⃣ Wait for Instagram to finish processing
    await waitForInstagramProcessing(IG_ID, creationId, TOKEN, 10, 2000);

    // 3️⃣ Publish media container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${IG_ID}/media_publish`,
      {
        method: "POST",
        body: new URLSearchParams({
          access_token: TOKEN,
          creation_id: creationId,
        }),
      }
    );

    const publishJson: any = await publishRes.json();

    if (!publishRes.ok) {
      console.error("❌ INSTAGRAM PUBLISH ERROR:", publishJson);
      return { error: publishJson };
    }

    console.log("✅ IG PUBLISHED:", publishJson);
    return publishJson;
  } catch (err) {
    console.error("INSTAGRAM ERROR:", err);
    return { error: String(err) };
  }
}
