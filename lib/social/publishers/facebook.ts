// Platform entry point
// Delegates to pipeline-based implementation


export async function publishToFacebook(caption: string, base64Image: string) {
  try {
    const PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
    const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;

    if (!PAGE_ID || !PAGE_TOKEN) {
      console.error("Facebook config error: PAGE_ID or PAGE_TOKEN missing");
      return { error: "Missing Facebook credentials" };
    }

    const buffer = Buffer.from(base64Image, "base64");

    // Facebook requires File or Blob depending on runtime
    const blob = new Blob([buffer], { type: "image/png" });
    const file = new File([blob], "deal.png", { type: "image/png" });

    // -------------------------------
    // 1) Upload photo (unpublished)
    // -------------------------------
    const uploadForm = new FormData();
    uploadForm.append("access_token", PAGE_TOKEN);
    uploadForm.append("source", file);
    uploadForm.append("published", "false");

    const photoEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;

    let uploadRes = await fetch(photoEndpoint, {
      method: "POST",
      body: uploadForm,
    });

    let uploadJson: any = await uploadRes.json();

    if (!uploadRes.ok || !uploadJson.id) {
      console.error("❌ FACEBOOK PHOTO UPLOAD ERROR:", uploadJson);
      return { error: uploadJson };
    }

    const photoId = uploadJson.id as string;

    // -------------------------------
    // 2) Create post on the Page feed
    // -------------------------------
    const feedEndpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`;

    const feedBody = new URLSearchParams();
    feedBody.append("access_token", PAGE_TOKEN);
    // For feed posts, the param is `message`, not `caption`
    feedBody.append("message", caption);
    // Attach the previously uploaded media
    feedBody.append(
      "attached_media[0]",
      JSON.stringify({ media_fbid: photoId })
    );

    let feedRes = await fetch(feedEndpoint, {
      method: "POST",
      body: feedBody,
    });

    let feedJson: any = await feedRes.json();

    if (!feedRes.ok) {
      console.error("❌ FACEBOOK FEED POST ERROR:", feedJson);
      return { error: feedJson };
    }

    return feedJson; // contains post id, etc.
  } catch (err) {
    console.error("Facebook publish error:", err);
    return { error: String(err) };
  }
}
