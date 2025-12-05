export async function publishToFacebook(caption: string, base64Image: string) {
  try {
    const PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
    const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN!;

    const buffer = Buffer.from(base64Image, "base64");

    // Facebook requires File OR Blob — ensure compatibility across runtimes
    const blob = new Blob([buffer], { type: "image/png" });
    const file = new File([blob], "deal.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("access_token", PAGE_TOKEN);
    formData.append("caption", caption);
    formData.append("source", file);

    const endpoint = `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`;

    let res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    let json = await res.json();

    // Retry automatically if Facebook returns temporary upload errors
    if (!res.ok) {
      console.warn("⚠️ Facebook upload failed. Retrying once...", json);

      await new Promise((r) => setTimeout(r, 1500));

      res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      json = await res.json();

      if (!res.ok) {
        console.error("❌ FACEBOOK FINAL ERROR:", json);
        return { error: json };
      }
    }

    return json;
  } catch (err) {
    console.error("Facebook publish error:", err);
    return null;
  }
}
