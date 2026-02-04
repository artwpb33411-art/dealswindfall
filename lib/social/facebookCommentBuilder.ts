import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Lang = "en" | "es";

type VariantRow = {
  text: string;
  weight: number;
};

async function getVariants(platform: string, variantType: string, lang: Lang) {
  const { data, error } = await supabaseAdmin
    .from("social_comment_variants")
    .select("text,weight")
    .eq("platform", platform)
    .eq("variant_type", variantType)
    .eq("language", lang)
    .eq("is_active", true);

  if (error) {
    console.error("Variant load error:", error);
    return [] as VariantRow[];
  }
  return (data ?? []) as VariantRow[];
}

// deterministic pick: stable per deal
function pickDeterministic(rows: VariantRow[], seed: number): string | null {
  if (!rows.length) return null;
  const idx = Math.abs(seed) % rows.length;
  return rows[idx].text;
}

// helper: extract deal id from your deal URL (?deal=8252)
function getDealIdFromUrl(dealUrl: string): number {
  try {
    const u = new URL(dealUrl);
    const id = Number(u.searchParams.get("deal"));
    return Number.isFinite(id) ? id : 0;
  } catch {
    return 0;
  }
}

export async function buildFacebookEngagementComment({
  lang,
  dealUrl,
}: {
  lang: Lang;
  dealUrl: string;
}): Promise<string> {
  const dealId = getDealIdFromUrl(dealUrl);

  const rows = await getVariants("facebook", "engagement", lang);

  const fallback =
    lang === "es"
      ? "¿Te gusta esta oferta? 👇"
      : "Do you like this deal? 👇";

  return pickDeterministic(rows, dealId + 101) ?? fallback;
}

export async function buildFacebookLinkComment({
  lang,
  dealUrl,
}: {
  lang: Lang;
  dealUrl: string;
}): Promise<string> {
  const dealId = getDealIdFromUrl(dealUrl);

  const rows = await getVariants("facebook", "intro", lang);

  const fallback =
    lang === "es"
      ? "Aquí está el enlace verificado 👇"
      : "Here’s the verified deal link 👇";

  const intro = pickDeterministic(rows, dealId + 202) ?? fallback;

  // stage 2 ALWAYS uses DealsWindfall URL now
  return `${intro}\n${dealUrl}`;
}
