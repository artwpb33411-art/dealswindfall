import type { SelectedDeal } from "./types";

export type SocialContent = {
  text: string;
  short: string;
  url: string;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function trimTo(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}
export function buildCaption(
  deal: SelectedDeal,
  hashtags: string[] = []
): SocialContent {
  const price =
    deal.price != null
      ? `$${Number(deal.price).toFixed(2)}`
      : "Great price";

  const discount =
    deal.percent_diff != null
      ? ` (${deal.percent_diff}% OFF)`
      : "";

  const store =
    deal.store_name ? ` at ${deal.store_name}` : "";

  // ✅ SHORT, CLEAN, STABLE SOCIAL URL
  const url = `https://www.dealswindfall.com/?deal=${deal.id}`;

  // -----------------------
  // Normalize & finalize hashtags
  // -----------------------
  const finalHashtags = Array.from(
    new Set(
      ["#dealswindfall", ...hashtags]
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith("#") ? t : `#${t}`))
        .map(t => t.toLowerCase())
    )
  );

  const hashtagText =
    finalHashtags.length > 0
      ? `\n\n${finalHashtags.join(" ")}`
      : "";

  // -----------------------
  // Captions
  // -----------------------
  const longCaptionRaw = `
🔥 Deal Alert: ${deal.title}

${price}${discount}${store}

👇 Grab it now:
${url}${hashtagText}
`.trim();

  const shortRaw = `${deal.title} — ${price}${discount}${store}. Grab it now: ${url}`;

  return {
    text: escapeHtml(longCaptionRaw),
    short: trimTo(
      finalHashtags.length > 0
        ? `${shortRaw} ${finalHashtags.join(" ")}`
        : shortRaw,
      250
    ),
    url,
  };
}
