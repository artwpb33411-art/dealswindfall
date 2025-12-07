import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { SelectedDeal } from "./types";

/**
 * Picks a deal published within the last X minutes,
 * where X = social_interval_minutes from settings.
 * Also filters by allowed stores.
 */
export async function pickDealForSocial(): Promise<SelectedDeal | null> {
  // Load settings
  const { data: settings, error: settingsErr } = await supabaseAdmin
    .from("auto_publish_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (settingsErr || !settings) {
    console.error("❌ Failed to load autopublish settings:", settingsErr);
    return null;
  }

  const intervalMinutes = settings.social_interval_minutes || 60;
  const allowedStores: string[] = settings.allowed_stores || ["Amazon", "Walmart"];

  // Time window
  const intervalAgo = new Date(Date.now() - intervalMinutes * 60 * 1000).toISOString();

  // Try primary time window first
  const deal = await tryFetchDeal(intervalAgo, allowedStores);
  if (deal) return deal;

  // If nothing found, fallback #1 → past 6 hours
  const fallback6h = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const deal6h = await tryFetchDeal(fallback6h, allowedStores);
  if (deal6h) return deal6h;

  // Fallback #2 → past 24 hours
  const fallback24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const deal24h = await tryFetchDeal(fallback24h, allowedStores);
  if (deal24h) return deal24h;

  console.warn("⚠ No deals found within 24 hours for allowed stores:", allowedStores);
  return null;
}

/**
 * Helper function to fetch deals after a given timestamp.
 */
async function tryFetchDeal(sinceTime: string, allowedStores: string[]) {
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
    .gte("published_at", sinceTime)
    .neq("exclude_from_auto", true)
    .in("store_name", allowedStores)
    .order("published_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("❌ dealSelector query failed:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Random pick
  const random = data[Math.floor(Math.random() * data.length)];

  return {
    id: random.id,
    title: random.description,
    description: random.notes,
    price: random.current_price,
    old_price: random.old_price,
    percent_diff: random.percent_diff,
    store_name: random.store_name,
    image_link: random.image_link,
    slug: random.slug,
  };
}
