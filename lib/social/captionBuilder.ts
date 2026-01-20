import type { SelectedDeal } from "./types";
import { SOCIAL_TEXT, SocialLang } from "./socialText";

export type Platform = "facebook" | "instagram" | "telegram" | "x";

export type PlatformCaption = {
  text: string;
  firstComment?: string; // Facebook only
};

export type PlatformCaptions = Record<Platform, PlatformCaption>;



export type SocialContent = {
  text: string;
  short: string;
  url: string;
};


function formatPrice(deal: SelectedDeal) {
  return deal.price != null
    ? `$${Number(deal.price).toFixed(2)}`
    : "Great price";
}

function buildDiscount(deal: SelectedDeal) {
  return deal.percent_diff != null
    ? ` (${deal.percent_diff}% OFF)`
    : "";
}

function buildStore(deal: SelectedDeal) {
  return deal.store_name ? ` at ${deal.store_name}` : "";
}

function buildDealUrl(deal: SelectedDeal) {
  return `https://www.dealswindfall.com/?deal=${deal.id}`;
}

function normalizeHashtags(hashtags: string[]) {
  return Array.from(
    new Set(
      ["#dealswindfall", ...hashtags]
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith("#") ? t : `#${t}`))
        .map(t => t.toLowerCase())
    )
  );
}



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

export function buildPlatformCaptions(
  deal: SelectedDeal,
  hashtags: string[] = [],
  lang: "en" | "es" = "en"
)
: {
  captions: PlatformCaptions;
  url: string;
} {
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

  // ✅ Clean, stable URL (same as before)
  const url = `https://www.dealswindfall.com/?deal=${deal.id}`;

  // -----------------------
  // Hashtags (same logic)
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
const t = SOCIAL_TEXT[lang];

  const hashtagText =
    finalHashtags.length > 0
      ? `\n\n${finalHashtags.join(" ")}`
      : "";

  // -----------------------
  // Shared base caption (NO LINK)
  // -----------------------
  const baseCaption = `
${t.dealAlert}: ${deal.title}

${price}${discount}${store}

${t.limitedTime}
${t.moreDeals}
`.trim();

  // -----------------------
  // Platform captions
  // -----------------------
  const captions: PlatformCaptions = {
  facebook: {
  text: escapeHtml(
    `${baseCaption}

${t.linkInComments}${hashtagText}`
  ),
  firstComment: url,
},


   instagram: {
  text: escapeHtml(
    `${baseCaption}

${t.grabNow}
${url}${hashtagText}`
  ),
},


 telegram: {
  text: escapeHtml(
    `${baseCaption}

${t.viewDeal}
${url}${hashtagText}`
  ),
},



   x: {
  text: escapeHtml(
    trimTo(
      [
        `${deal.title}`,
        `${price}${discount}${store}`,
        "",
        `👉 ${url}`,
        "",
        finalHashtags.join(" "),
      ].join("\n"),
      280
    )
  ),
},

  };

  return {
    captions,
    url,
  };
}
