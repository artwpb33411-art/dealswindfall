import type { SelectedDeal } from "../types";

export function resolveFlyerTitle(
  deal: SelectedDeal,
  lang: "en" | "es",
  fallback: string
): string {
  if (lang === "es") {
    return (
      deal.flyer_text_es?.trim() ||
      deal.description_es?.trim() ||
      deal.description?.trim() ||   // English title fallback
      deal.notes_es?.trim() ||       // long ES description (last resort)
      fallback
    );
  }

  return (
    deal.flyer_text_en?.trim() ||
    deal.description?.trim() ||     // English title
    deal.notes?.trim() ||           // long EN description (last resort)
    fallback
  );
}
