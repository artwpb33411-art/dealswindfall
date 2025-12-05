import { NextResponse } from "next/server";
import OpenAI from "openai";

function fallbackDescription(title: string, notes: string) {
  if (notes?.trim()) return notes;
  return `${title || "This product"} is available now. Don’t miss this offer!`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, notes, store, category } = body;

  const originalTitle = title || "";
  const originalNotes = notes || "";

  const apiKey = process.env.CHATGPT_API_KEY;
  if (!apiKey) {
    // AI unavailable → fallback
    const fallback = fallbackDescription(originalTitle, originalNotes);
    return NextResponse.json({
      success: false,
      title_en: originalTitle,
      description_en: fallback,
      title_es: originalTitle,
      description_es: fallback,
    });
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `
Rewrite the following product content for a deals website:

1. "title_en":
   - Rewrite the English title.
   - 8–14 words.
   - Clear, natural, human.
   - Slight SEO optimization.
   - Not clickbait or keyword-stuffed.

2. "description_en":
   - Rewrite the English description into 150–300 words.
   - 2–4 short paragraphs.
   - Friendly, helpful tone.
   - Light SEO optimization.
   - Optional bullet points.
   - End with a soft call-to-action.

3. Translate both into Spanish as:
   - "title_es"
   - "description_es"
   - Neutral Latin-American Spanish.
   - Same length & meaning.

Return ONLY valid JSON:

{
  "title_en": "",
  "description_en": "",
  "title_es": "",
  "description_es": ""
}

Product Data:
English Title: ${originalTitle}
English Description: ${originalNotes}
Store: ${store || "N/A"}
Category: ${category || "N/A"}
`;

  try {
    const ai = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 900,
    });

    let raw = ai.output_text || "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse failed:", cleaned);
      const fb = fallbackDescription(originalTitle, originalNotes);
      return NextResponse.json({
        success: false,
        title_en: originalTitle,
        description_en: fb,
        title_es: originalTitle,
        description_es: fb,
      });
    }

    return NextResponse.json({
      success: true,
      title_en: parsed.title_en || originalTitle,
      description_en: parsed.description_en || fallbackDescription(originalTitle, originalNotes),
      title_es: parsed.title_es || originalTitle,
      description_es: parsed.description_es || fallbackDescription(originalTitle, originalNotes),
    });
  } catch (err) {
    console.error("GPT-4.1-mini error:", err);
    const fb = fallbackDescription(originalTitle, originalNotes);
    return NextResponse.json({
      success: false,
      title_en: originalTitle,
      description_en: fb,
      title_es: originalTitle,
      description_es: fb,
    });
  }
}
