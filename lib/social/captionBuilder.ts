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

export function buildCaption(deal: SelectedDeal): SocialContent {
  const price = deal.price != null ? `$${Number(deal.price).toFixed(2)}` : "Great price";

  const discount =
    deal.percent_diff != null ? ` (${deal.percent_diff}% OFF)` : "";

  const store = deal.store_name ? ` at ${deal.store_name}` : "";

  const url = `https://www.dealswindfall.com/deals/${deal.id}-${deal.slug}`;

  const longCaptionRaw = `
🔥 Deal Alert: ${deal.title}

${price}${discount}${store}

👇 Grab it now:
${url}

#DealsWindfall #Deals #SaveMoney #Offers #Coupons
`.trim();

  const shortRaw = `${deal.title} — ${price}${discount}${store}. Grab it now: ${url}`;

  return {
    text: escapeHtml(longCaptionRaw),
    short: trimTo(shortRaw, 250),
    url,
  };
}