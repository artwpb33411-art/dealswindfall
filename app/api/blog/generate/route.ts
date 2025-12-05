import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic: string = body.topic?.trim() || "";
    const notes: string = body.notes?.trim() || "";

    if (!topic) {
      return NextResponse.json(
        { error: "Missing topic" },
        { status: 400 }
      );
    }

    // ⭐ GPT-4o-mini with JSON mode
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }, // 🔥 Guarantees valid JSON
      messages: [
        {
          role: "system",
          content: `
You write bilingual (English + Spanish) blog posts for DealsWindfall.

Tone:
- Short
- Friendly
- Casual
- Helpful
- Easy to read
- Not clickbait

Length:
- 500–700 words per language
- Short paragraphs
- Clear H1/H2/H3
- Bullet points are welcome

Rules:
- MUST return ONLY valid JSON.
- NO text outside JSON.
- NO markdown.
- NO commentary.
- ALL "content_en" and "content_es" MUST be valid HTML (<h1>, <p>, <ul>, etc).
- Escape all quotes properly.
- Mention DealsWindfall casually once in each language.
`
        },
        {
          role: "user",
          content: `
Generate a short, friendly, bilingual blog post about:

Topic: "${topic}"
Extra notes: "${notes || "none"}"

Return ONLY the following JSON:

{
  "title_en": "",
  "title_es": "",
  "slug": "",
  "content_en": "",
  "content_es": "",
  "meta_title_en": "",
  "meta_title_es": "",
  "meta_description_en": "",
  "meta_description_es": "",
  "tags": []
}

Rules:
- HTML only inside content fields.
- No backticks.
- No markdown.
- Slug must be URL-safe.
- Titles must be short & catchy.
- Meta descriptions: 150–160 chars max.
- Tags: array of 3–6 useful words.
`
        }
      ],
      max_tokens: 4000,
      temperature: 0.55,
    });

    // ⭐ GPT-4o JSON MODE → parsed object available directly
    const output = completion.choices[0].message;

    const json =
      (output as any).parsed ??
      JSON.parse(output.content || "{}"); // fallback safety

    // ⭐ Final cleanup
    json.slug = slugify(json.slug || json.title_en || topic);

    if (!Array.isArray(json.tags)) {
      json.tags = [];
    }

    return NextResponse.json(json, { status: 200 });

  } catch (err) {
    console.error("AI blog generation error:", err);

    return NextResponse.json(
      {
        error:
          "AI failed to generate blog content. Please try again.",
      },
      { status: 500 }
    );
  }
}
