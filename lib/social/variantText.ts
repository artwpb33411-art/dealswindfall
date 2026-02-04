import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SOCIAL_TEXT, SocialLang } from "./socialText";

type VariantRow = {
  variant_type: keyof typeof SOCIAL_TEXT["en"]; // dealAlert, limitedTime, ...
  text: string;
  language: SocialLang; // "en" | "es"
  platform: "all"; // for now
  is_active: boolean;
  weight: number | null;
};

let cache: { at: number; rows: VariantRow[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

async function fetchVariants(): Promise<VariantRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.rows;

  const { data, error } = await supabaseAdmin
    .from("social_comment_variants")
    .select("variant_type,text,language,platform,is_active,weight")
    .eq("is_active", true)
    .eq("platform", "all");

  cache = { at: now, rows: (error ? [] : (data ?? [])) as VariantRow[] };
  return cache.rows;
}

function pickDeterministic<T>(rows: T[], seed: number): T | null {
  if (!rows?.length) return null;
  const idx = Math.abs(seed) % rows.length;
  return rows[idx];
}

export async function getSocialTextDynamic(lang: SocialLang, dealId: number) {
  const base = SOCIAL_TEXT[lang];
  const rows = await fetchVariants();

  const byType = new Map<VariantRow["variant_type"], VariantRow[]>();
  for (const r of rows) {
    if (r.language !== lang) continue;
    const arr = byType.get(r.variant_type) ?? [];
    arr.push(r);
    byType.set(r.variant_type, arr);
  }

  const get = (key: keyof typeof base, salt: number) => {
    const chosen = pickDeterministic(byType.get(key) ?? [], dealId + salt);
    return chosen?.text ?? base[key];
  };

  return {
    dealAlert: get("dealAlert", 11),
    limitedTime: get("limitedTime", 22),
    moreDeals: get("moreDeals", 33),
    linkInComments: get("linkInComments", 44),
    grabNow: get("grabNow", 55),
    viewDeal: get("viewDeal", 66),
    off: base.off, // keep as-is for now
  };
}
