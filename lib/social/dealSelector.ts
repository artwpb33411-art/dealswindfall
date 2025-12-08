import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { SelectedDeal } from "./types";

export async function pickDealForSocial(): Promise<SelectedDeal | null> {
  const { data: settings } = await supabaseAdmin
    .from("auto_publish_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!settings) return null;

  const intervalMinutes = settings.social_interval_minutes || 60;
  const allowedStores = settings.allowed_stores || ["Amazon", "Walmart"];

  const intervalAgo = new Date(Date.now() - intervalMinutes * 60000).toISOString();

  const deal = await tryFetchDeal(intervalAgo, allowedStores);
  if (deal) return deal;

  const sixHours = new Date(Date.now() - 6 * 3600000).toISOString();
  const deal6 = await tryFetchDeal(sixHours, allowedStores);
  if (deal6) return deal6;

  const day = new Date(Date.now() - 24 * 3600000).toISOString();
  return await tryFetchDeal(day, allowedStores);
}

async function tryFetchDeal(since: string, allowedStores: string[]) {
  const { data } = await supabaseAdmin
    .from("deals")
    .select(`
      id,
      description,
      notes,
      current_price,
      old_price,
      percent_diff,
      price_diff,
      image_link,
      product_link,
      review_link,
      store_name,
      slug
    `)
    .gte("published_at", since)
    .eq("exclude_from_auto", false)
    .in("store_name", allowedStores)
    .order("published_at", { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return null;

  const r = data[Math.floor(Math.random() * data.length)];

  const mapped: SelectedDeal = {
    id: r.id,
    title: r.description,
    description: r.notes,

    price: r.current_price ?? null,
    old_price: r.old_price ?? null,
    percent_diff: r.percent_diff ?? null,

    current_price: r.current_price ?? null,
    price_diff: r.price_diff ?? null,

    image_link: r.image_link,
    product_link: r.product_link,
    review_link: r.review_link,
    store_name: r.store_name,
    slug: r.slug,
  };

  return mapped;
}
