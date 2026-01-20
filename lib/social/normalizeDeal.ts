// lib/social/normalizeDeal.ts
import type { SelectedDeal } from "./types";

export function normalizeDeal(raw: any): SelectedDeal {
  return {
    id: raw.id,
    title: raw.title ?? raw.description ?? "Untitled deal",
    description: raw.notes ?? raw.description ?? null,
    image_link: raw.image_link ?? null,
    slug: raw.slug ?? null,
    store_name: raw.store_name ?? null,

    price: raw.current_price ?? null,
    old_price: raw.old_price ?? null,
    percent_diff: raw.percent_diff ?? null,

    current_price: raw.current_price ?? null,
    price_diff: raw.price_diff ?? null,
    product_link: raw.product_link ?? null,
    review_link: raw.review_link ?? null,
  };
}


