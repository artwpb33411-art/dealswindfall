export async function publishToTelegram(caption: string, base64Image: string) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

    // Telegram limit ~1024 chars
    const cleanCaption =
      caption.length > 1020 ? caption.slice(0, 1017) + "..." : caption;

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("caption", cleanCaption);
    formData.append("parse_mode", "HTML");

    const buffer = Buffer.from(base64Image, "base64");
    const file = new Blob([buffer], { type: "image/png" });

    formData.append("photo", file, "deal.png");

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    // Telegram common fallback: try without HTML mode
    if (!res.ok) {
      console.warn("⚠️ Telegram HTML mode failed, retrying without parse_mode.");

      const formData2 = new FormData();
      formData2.append("chat_id", CHAT_ID);
      formData2.append("caption", cleanCaption);
      formData2.append("photo", file, "deal.png");

      const res2 = await fetch(url, { method: "POST", body: formData2 });
      return await res2.json();
    }

    return json;
  } catch (err) {
    console.error("Telegram publish error:", err);
    return null;
  }
}
