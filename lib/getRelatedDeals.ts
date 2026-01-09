import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RelatedDealDBRow = {
  id: number;
  slug: string | null;
  description: string | null;
  description_es: string | null;
  current_price: number | null;
  old_price: number | null;
  image_link: string | null;
  store_name: string | null;
  category: string | null;
  published_at: string | null;
};

type GetRelatedDealsInput = {
  dealId: number;
  category?: string | null;
  store?: string | null;
  price?: number | null;
  excludeIds?: number[]; // ✅ ADD THIS
};


const MAX_AGE_HOURS = 48;
const LIMIT = 5;

export async function getRelatedDeals({
  dealId,
  category,
  store,
  price,
  excludeIds = [], // ✅ ADD THIS
}: GetRelatedDealsInput) {

  const since = new Date(
    Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000
  ).toISOString();

  let query = supabaseAdmin
  .from("deals")
  .select(`
    id,
    slug,
    description,
    current_price,
    old_price,
    image_link,
    store_name,
    category,
    published_at
  `)
  .eq("status", "Published")
  .gte("published_at", since)
  .neq("id", dealId)
  .is("superseded_by_id", null)
  .order("published_at", { ascending: false })
  .limit(LIMIT);

// ✅ Exclude recently viewed deals
if (excludeIds && excludeIds.length > 0) {
  query = query.not("id", "in", `(${excludeIds.join(",")})`);
}


  if (category) {
    query = query.eq("category", category);
  }

  if (price && price > 0) {
    query = query
      .gte("current_price", price * 0.7)
      .lte("current_price", price * 1.3);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getRelatedDeals error:", error);
    return [];
  }

  // 🔁 Normalize DB → UI shape
  return (data as RelatedDealDBRow[]).map((d) => ({
    id: d.id,
    slug: d.slug ?? "",
    title: d.description ?? "",
    price: d.current_price,
    old_price: d.old_price,
    image_url: d.image_link,
    store_name: d.store_name,
  }));
}
