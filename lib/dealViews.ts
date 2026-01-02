import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDealViewsLastHour(dealId: number): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("deal_page_views")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId)
    .gte("created_at", oneHourAgo);

  if (error) {
    console.error("getDealViewsLastHour error:", error);
    return 0;
  }

  return count ?? 0;
}
