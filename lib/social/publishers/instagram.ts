export async function publishToInstagram(caption: string, imageBase64: string) {
  try {
    const IG_ID = process.env.INSTAGRAM_BUSINESS_ID!;
    const TOKEN = process.env.INSTAGRAM_LONG_LIVED_TOKEN!;

    const endpoint = `https://graph.facebook.com/v19.0/${IG_ID}/media`;

    const params = new URLSearchParams({
      access_token: TOKEN,
      caption,
      image_base64: imageBase64,
    });

    // Step 1 — Upload media to Graph API
    let uploadRes = await fetch(endpoint, {
      method: "POST",
      body: params,
    });

    let uploadJson = await uploadRes.json();

    // Retry upload if needed
    if (!uploadJson.id) {
      console.warn("⚠️ IG Upload failed, retrying...", uploadJson);

      await new Promise((r) => setTimeout(r, 1500));

      uploadRes = await fetch(endpoint, {
        method: "POST",
        body: params,
      });

      uploadJson = await uploadRes.json();

      if (!uploadJson.id) {
        console.error("❌ INSTAGRAM UPLOAD ERROR:", uploadJson);
        return uploadJson;
      }
    }

    // Step 2 — Publish media
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${IG_ID}/media_publish`,
      {
        method: "POST",
        body: new URLSearchParams({
          access_token: TOKEN,
          creation_id: uploadJson.id,
        }),
      }
    );

    const publishJson = await publishRes.json();
    return publishJson;
  } catch (err) {
    console.error("INSTAGRAM ERROR:", err);
    return null;
  }
}
