import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { SelectedDeal } from "./types";

export async function pickDealFromLastHour(): Promise<SelectedDeal | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("deals")
    .select(`
      id,
      description,
      notes,
      current_price,
      old_price,
      percent_diff,
      store_name,
      image_link,
      slug
    `)
    .gte("published_at", oneHourAgo)
    .neq("exclude_from_auto", true)
    .in("store_name", ["Amazon", "Walmart"])   // ⭐ NEW FILTER ADDED
    .order("published_at", { ascending: false })
    .limit(20);  // increased slightly to get more choices

  if (error) {
    console.log("pickDealFromLastHour error:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Pick a random deal out of the filtered list
  const deal = data[Math.floor(Math.random() * data.length)];

  return {
    id: deal.id,
    title: deal.description,
    description: deal.notes,
    price: deal.current_price,
    old_price: deal.old_price,
    percent_diff: deal.percent_diff,
    store_name: deal.store_name,
    image_link: deal.image_link,
    slug: deal.slug,
  };
}
