// lib/social/normalizeDeal.ts
import type { SelectedDeal } from "./types";
export function normalizeDeal(raw: any): SelectedDeal {
  return {
    id: raw.id,

    // English
    title: raw.title ?? raw.description ?? "Untitled deal",
    description: raw.notes ?? raw.description ?? null,

    // Spanish (NEW – REQUIRED)
    description_es: raw.description_es ?? null,
    notes_es: raw.notes_es ?? null,

    image_link: raw.image_link,
    slug: raw.slug,
    store_name: raw.store_name,

    price: raw.price ?? raw.current_price ?? null,
    old_price: raw.old_price ?? null,
    percent_diff: raw.percent_diff ?? null,

    current_price: raw.current_price ?? null,
    price_diff: raw.price_diff ?? null,

    product_link: raw.product_link,
    review_link: raw.review_link,

    affiliate_url:
  raw.affiliate_short_url ??
  raw.product_link ??
  null,

  };
}
