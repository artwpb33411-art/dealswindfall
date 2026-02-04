import type { SelectedDeal } from "./types";
import { SOCIAL_TEXT, SocialLang } from "./socialText";
//import { getSocialTextDynamic } from "@/lib/social/variantText";

import { getCaptionTextDynamic } from "./getCaptionTextDynamic";
//import { SOCIAL_TEXT } from "./socialText";


export type Platform = "facebook" | "instagram" | "telegram" | "x";

export type PlatformCaption = {
  text: string;
  firstComment?: string;
};

export type PlatformCaptions = Record<Platform, PlatformCaption>;

export type SocialContent = {
  text: string;
  short: string;
  url: string;
};

/* ---------------- helpers ---------------- */

function resolveTitle(deal: SelectedDeal, lang: SocialLang): string {
  return lang === "es"
    ? deal.description_es?.trim() ||
        deal.title?.trim() ||
        deal.description?.trim() ||
        "Oferta destacada"
    : deal.title?.trim() ||
        deal.description?.trim() ||
        "Hot Deal";
}

function formatPrice(deal: SelectedDeal): string {
  return deal.price != null
    ? `$${Number(deal.price).toFixed(2)}`
    : "Great price";
}

function buildDiscount(deal: SelectedDeal, lang: SocialLang): string {
  const off = SOCIAL_TEXT[lang].off;

  return deal.percent_diff != null
    ? ` (${deal.percent_diff}% ${off})`
    : "";
}


function buildStore(deal: SelectedDeal, lang: SocialLang): string {
  if (!deal.store_name) return "";
  return lang === "es"
    ? ` en ${deal.store_name}`
    : ` at ${deal.store_name}`;
}

function buildDealUrl(deal: SelectedDeal): string {
  return `https://www.dealswindfall.com/?deal=${deal.id}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function trimTo(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

/* ---------------- simple caption ---------------- */

export async function buildCaption(
  deal: SelectedDeal,
  hashtags: string[] = [],
  lang: SocialLang = "en"
): Promise<SocialContent> {
  const t = await getCaptionTextDynamic(lang, deal.id);
  const title = resolveTitle(deal, lang);
  const price = formatPrice(deal);
  const discount = buildDiscount(deal, lang);
  const store = buildStore(deal, lang);
  const url = buildDealUrl(deal);

  const finalHashtags = Array.from(
    new Set(
      ["#dealswindfall", ...hashtags]
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith("#") ? h : `#${h}`))
        .map(h => h.toLowerCase())
    )
  );

  const hashtagText =
    finalHashtags.length > 0 ? `\n\n${finalHashtags.join(" ")}` : "";

  const longCaptionRaw = `
${t.dealAlert}: ${title}

${price}${discount}${store}

${t.grabNow}
${url}${hashtagText}
`.trim();

  const shortRaw = `${title} — ${price}${discount}${store}. ${t.grabNow} ${url}`;

  return {
    text: longCaptionRaw,
    short: trimTo(
      finalHashtags.length > 0
        ? `${shortRaw} ${finalHashtags.join(" ")}`
        : shortRaw,
      250
    ),
    url,
  };
}

/* ---------------- platform captions ---------------- */
export async function buildPlatformCaptions(
  deal: SelectedDeal,
  hashtags: string[] = [],
  lang: SocialLang = "en"
): Promise<{ captions: PlatformCaptions; url: string }> {
  const t = await getCaptionTextDynamic(lang, deal.id);
  const title = resolveTitle(deal, lang);
  const price = formatPrice(deal);
  const discount = buildDiscount(deal, lang);
  const store = buildStore(deal, lang);
  const url = buildDealUrl(deal);

  const finalHashtags = Array.from(
    new Set(
      ["#dealswindfall", ...hashtags]
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith("#") ? h : `#${h}`))
        .map(h => h.toLowerCase())
    )
  );

  const hashtagText =
    finalHashtags.length > 0 ? `\n\n${finalHashtags.join(" ")}` : "";

  const baseCaption = `
${t.dealAlert}: ${title}

${price}${discount}${store}

${t.limitedTime}
${t.moreDeals}
`.trim();

const fbMoreDeals =
  lang === "en"
    ? "🌐 More verified deals on DealsWindfall"
    : "🌐 Más ofertas verificadas en DealsWindfall";

const facebookCaption = `
${t.dealAlert}: ${title}

${price}${discount}${store}

${t.limitedTime}



${t.linkInComments}
`.trim();






  const captions: PlatformCaptions = {
    facebook: {
      text: facebookCaption,
      firstComment: url,
    },

   instagram: {
  text: `${baseCaption}\n\n${t.grabNow}\n${url}${hashtagText}`,
},

telegram: {
  text: `${baseCaption}\n\n${t.viewDeal}\n${url}${hashtagText}`,
},

x: {
  text: trimTo(
    [
      title,
      `\n${price}${discount}${store}\n`,
      `👉 ${url}\n`,
      finalHashtags.join(" "),
    ].join("\n"),
    280
  ),
},

  };

  return { captions, url };
}
