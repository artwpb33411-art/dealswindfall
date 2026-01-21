import type { SelectedDeal } from "../types";
// lib/social/utils/normalizeFlyerTitle.ts

export function normalizeFlyerTitle(text: string): string {
  return text
    // Keep numeric phrases together (prevents ugly line breaks)
    .replace(/\b(\d+)\s+en\s+(\d+)\b/gi, "$1-en-$2")
    .replace(/\b(\d+)\s+in\s+(\d+)\b/gi, "$1-in-$2")
    .replace(/\s{2,}/g, " ")
    .trim();
}
