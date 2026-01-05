import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getDealViewsTotal(dealId: number): Promise<number> {
  const { count, error } = await supabase
    .from("deal_page_views")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId);

  if (error) {
    console.error("getDealViewsTotal error:", error);
    return 0;
  }

  return count ?? 0;
}
