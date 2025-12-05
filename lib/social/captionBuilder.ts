import type { SelectedDeal } from "./types";

export type SocialContent = {
  text: string;        // Long caption (Telegram / Facebook / Instagram)
  short: string;       // Short caption (X)
  url: string;
};

/** Escape HTML for Telegram */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Trim caption safely */
function trimTo(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

export function buildCaption(deal: SelectedDeal): SocialContent {
  // Discount calculation
  const discount =
    deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : null;

  const pricePart = deal.price ? `$${deal.price}` : "Great price";
  const discountPart = discount ? ` (${discount}% OFF)` : "";
  const storePart = deal.store_name ? ` at ${deal.store_name}` : "";

  // Correct Deal URL
  const url = `https://www.dealswindfall.com/deals/${deal.id}-${deal.slug}`;

  // ---------------------------
  // LONG CAPTION (FB/IG/Telegram)
  // ---------------------------
  const longCaptionRaw = `
🔥 Deal Alert: ${deal.title}

${pricePart}${discountPart}${storePart}

👇 Grab it now:
${url}

#DealsWindfall #Deals #SaveMoney #Offers #Coupons
`.trim();

  // Telegram-safe
  const longCaptionSafe = escapeHtml(longCaptionRaw);

  // ---------------------------
  // SHORT CAPTION (X / Twitter)
  // ---------------------------
  const shortCaptionRaw = `${deal.title} — ${pricePart}${discountPart}${storePart}.  
Grab it now: ${url}`;

  // X max: 280 chars (safe threshold 250)
  const shortCaptionSafe = trimTo(shortCaptionRaw.replace(/\n/g, " "), 250);

  return {
    text: longCaptionSafe,
    short: shortCaptionSafe,
    url,
  };
}
