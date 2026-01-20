import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getFacebookVariant(
  type: "intro" | "disclosure" | "brand",
  lang: "en" | "es"
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("social_comment_variants")
    .select("text")
    .eq("platform", "facebook")
    .eq("variant_type", type)
    .eq("language", lang)
    .eq("is_active", true)
    .order("weight", { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    throw new Error(`No active ${type} variant found for ${lang}`);
  }

  // Weighted-ish random
  return data[Math.floor(Math.random() * data.length)].text;
}
