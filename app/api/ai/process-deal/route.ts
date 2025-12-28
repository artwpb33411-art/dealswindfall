import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

function computeMetrics(oldP: number, currP: number) {
  if (!oldP || !currP || oldP <= 0 || currP <= 0) {
    return { price_diff: null, percent_diff: null, deal_level: null };
  }

  const diff = oldP - currP;
  const percent = Number(((diff / oldP) * 100).toFixed(2));

  let level: string | null = null;
  if (percent >= 40 && percent < 51) level = "Blistering deal";
  else if (percent >= 51 && percent < 61) level = "Scorching deal";
  else if (percent >= 61 && percent < 71) level = "Searing deal";
  else if (percent >= 71) level = "Flaming deal";

  return { price_diff: diff, percent_diff: percent, deal_level: level };
}

/* -------------------------------------------------------------
   OpenAI
------------------------------------------------------------- */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* -------------------------------------------------------------
   POST
------------------------------------------------------------- */

export async function POST(req: Request) {
  const { dealId, force } = await req.json();

  if (!dealId) {
    return NextResponse.json({ error: "Missing dealId" }, { status: 400 });
  }

  const { data: deal } = await supabaseAdmin
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

 if (deal.ai_status === "completed" && !force) {
  return NextResponse.json({
    ok: true,
    skipped: true,
    reason: "AI already completed",
  });
}

if (deal.ai_status === "skipped" && !force) {
  return NextResponse.json({
    ok: true,
    skipped: true,
    reason: "AI intentionally skipped",
  });
}



  await supabaseAdmin
    .from("deals")
    .update({ ai_status: "processing", ai_error: null })
    .eq("id", dealId);

  try {
    /* ---------------- AI CALL ---------------- */

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
Title: ${deal.description}
Notes: ${deal.notes || ""}
Store: ${deal.store_name || ""}
Category: ${deal.category || ""}
Price: ${deal.current_price} (old: ${deal.old_price})
          `,
        },
      ],
      max_tokens: 900,
    });

    const raw = ai.choices[0]?.message?.content || "";
    const parsed = JSON.parse(
      raw.replace(/```json/gi, "").replace(/```/g, "").trim()
    );

    /* ---------------- NORMALIZE ---------------- */

    const titleEn = parsed.title_en || deal.description;
    const notesEn = parsed.description_en || deal.notes || "";

    const titleEs = parsed.title_es || titleEn;
    const notesEs = parsed.description_es || notesEn;

    const metrics = computeMetrics(deal.old_price, deal.current_price);

    /* ---------------- UPDATE DEAL ---------------- */

    await supabaseAdmin
      .from("deals")
      .update({
        description: titleEn,
        notes: notesEn,
        description_es: titleEs,
        notes_es: notesEs,
        slug_es: slugify(titleEs),
        ...metrics,
        ai_status: "completed",
        ai_generated_at: new Date().toISOString(),
      })
      .eq("id", dealId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await supabaseAdmin
      .from("deals")
      .update({
        ai_status: "failed",
        ai_error: err.message,
      })
      .eq("id", dealId);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
