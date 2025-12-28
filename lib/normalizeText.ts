// lib/normalizeText.ts
export function normalizeText(input?: string | null) {
  if (!input) return input;
  return input
    .replace(/â€™/g, "’")
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .trim();
}
