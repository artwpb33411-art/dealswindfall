import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SOCIAL_TEXT, type SocialLang } from "./socialText";

type CaptionKey = keyof typeof SOCIAL_TEXT["en"]; // dealAlert, grabNow, etc.

type Row = {
  variant_type: CaptionKey;
  text: string;
  language: SocialLang;
  platform: string;
  is_active: boolean;
};

const CAPTION_KEYS: CaptionKey[] = [
  "dealAlert",
  "limitedTime",
  "moreDeals",
  "linkInComments",
  "grabNow",
  "viewDeal",
  // keep "off" from SOCIAL_TEXT (no need to randomize)
];

let cache: { at: number; rows: Row[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

function pickDeterministic<T>(rows: T[], seed: number): T | null {
  if (!rows?.length) return null;
  const idx = Math.abs(seed) % rows.length;
  return rows[idx];
}

export async function getCaptionTextDynamic(lang: SocialLang, dealId: number) {
  const base = SOCIAL_TEXT[lang];
  const now = Date.now();

  if (!cache || now - cache.at > TTL_MS) {
    const { data, error } = await supabaseAdmin
      .from("social_comment_variants")
      .select("variant_type,text,language,platform,is_active")
      .eq("is_active", true)
      .eq("platform", "all")
      .in("variant_type", CAPTION_KEYS);

    cache = { at: now, rows: (error ? [] : (data ?? [])) as Row[] };
  }

  const rows = cache.rows.filter(r => r.language === lang);

  const byType = new Map<CaptionKey, Row[]>();
  for (const r of rows) {
    const key = r.variant_type;
    const arr = byType.get(key) ?? [];
    arr.push(r);
    byType.set(key, arr);
  }

  const get = (key: CaptionKey, salt: number) =>
    pickDeterministic(byType.get(key) ?? [], dealId + salt)?.text ?? base[key];

  return {
    dealAlert: get("dealAlert", 11),
    limitedTime: get("limitedTime", 22),
    moreDeals: get("moreDeals", 33),
    linkInComments: get("linkInComments", 44),
    grabNow: get("grabNow", 55),
    viewDeal: get("viewDeal", 66),
    off: base.off, // keep static; used by buildDiscount
  };
}
