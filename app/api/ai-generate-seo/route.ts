import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Fallback if AI unavailable or returns invalid JSON
 */
function fallbackSEO(title: string, notes: string) {
  const cleanDesc = notes?.trim()
    ? notes
    : `${title || "This product"} is available now. Don’t miss this offer!`;

  return {
    title_en: title,
    description_en: cleanDesc,
    title_es: title,
    description_es: cleanDesc,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const englishTitle = body.title || body.description || "";
    const englishNotes = body.notes || "";

    if (!englishTitle.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing English Title" },
        { status: 400 }
      );
    }

    const productInfo = `
English Title: ${englishTitle}
English Description: ${englishNotes}
Category: ${body.category || "N/A"}
Store: ${body.storeName || "N/A"}
Price: ${body.currentPrice || "N/A"} (old: ${body.oldPrice || "N/A"})
Shipping: ${body.shippingCost || "N/A"}
Coupon: ${body.couponCode || "None"}
Holiday/Event: ${body.holidayTag || "None"}
Product Link: ${body.productLink || "None"}
    `.trim();

    // -------------------------------------------
    //  GPT-4o-mini (Chat Completions API)
    // -------------------------------------------
    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Rewrite this product for a deals website and return ONLY valid JSON:

{
  "title_en": "",
  "description_en": "",
  "title_es": "",
  "description_es": ""
}

Product Data:
${productInfo}
        `.trim(),
        },
      ],
      max_tokens: 900,
    });

    let raw = ai.choices?.[0]?.message?.content || "";

    if (!raw || typeof raw !== "string") {
      const fallback = fallbackSEO(englishTitle, englishNotes);
      return NextResponse.json({ success: false, ...fallback });
    }

    // Remove markdown fences
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parsing failed:", raw);
      const fallback = fallbackSEO(englishTitle, englishNotes);
      return NextResponse.json({ success: false, ...fallback });
    }

    return NextResponse.json(
      { success: true, ...parsed },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("AI ERROR:", err);
    const fallback = fallbackSEO("Untitled", "");
    return NextResponse.json(
      { success: false, ...fallback },
      { status: 500 }
    );
  }
}
