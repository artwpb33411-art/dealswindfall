import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const AI_SCORE_THRESHOLD = 75;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */
function computeMetrics(oldP: any, currP: any) {
  const oldPrice = oldP !== null && oldP !== undefined ? Number(oldP) : null;
  const currPrice = currP !== null && currP !== undefined ? Number(currP) : null;

  if (
    oldPrice === null ||
    currPrice === null ||
    Number.isNaN(oldPrice) ||
    Number.isNaN(currPrice) ||
    oldPrice <= 0 ||
    currPrice <= 0 ||
    currPrice >= oldPrice
  ) {
    return { price_diff: null, percent_diff: null, deal_level: null };
  }

  const price_diff = Number((oldPrice - currPrice).toFixed(2));
  const percent_diff = Number(((price_diff / oldPrice) * 100).toFixed(2));

  let deal_level: string | null = null;
  if (percent_diff >= 40 && percent_diff < 51) deal_level = "Blistering deal";
  else if (percent_diff >= 51 && percent_diff < 61) deal_level = "Scorching deal";
  else if (percent_diff >= 61 && percent_diff < 71) deal_level = "Searing deal";
  else if (percent_diff >= 71) deal_level = "Flaming deal";

  return { price_diff, percent_diff, deal_level };
}

function slugify(text?: string | null) {
  if (!text || typeof text !== "string") return null;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 120);
}

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function resolveStoreFromUrl(
  productUrl: string | null,
  stores: { store_name: string; store_url: string | null }[]
): string | null {
  if (!productUrl) return null;

  const host = extractHostname(productUrl);
  if (!host) return null;

  for (const store of stores) {
    if (!store.store_url) continue;

    const domains = store.store_url
      .split(",")
      .map(d => d.trim().toLowerCase());

    if (domains.some(d => host.includes(d))) {
      return store.store_name;
    }
  }

  return null;
}


function safeJsonParse(raw: string) {
  return JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
}

//const metrics = computeMetrics(deal.old_price, deal.current_price);


/* -------------------------------------------------------------
   POST
------------------------------------------------------------- */
export async function POST(req: Request) {
  const { dealId, force, preview } = await req.json();


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

  if ((deal.ai_status === "success" || deal.ai_status === "warning") && !force) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await supabaseAdmin
    .from("deals")
    .update({ ai_status: "processing", ai_error: null })
    .eq("id", dealId);

  try {

    /* -------- Reference Data -------- */

    const { data: stores } = await supabaseAdmin
      .from("stores")
      .select("store_name, store_url")
      .eq("is_active", true);

    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("category_name, sub_categories(sub_category_name)")
      .eq("is_active", true);

    const storeList = stores!.map(s => `- ${s.store_name}`).join("\n");

    const categoryTree = categories!
      .map(c => {
        const subs = c.sub_categories
          .map((s: any) => `  - ${s.sub_category_name}`)
          .join("\n");
        return `${c.category_name}:\n${subs}`;
      })
      .join("\n\n");

const resolvedStore =
  resolveStoreFromUrl(deal.product_link, stores || []) ||
  deal.store_name ||
  "Unknown";

      

    /* -------- AI Prompt -------- */

    const prompt = `
PRODUCT INFORMATION
-------------------
Product title (raw): ${deal.description}
Current price: ${deal.current_price}
Old price: ${deal.old_price}
Store: ${resolvedStore}
Product URL: ${deal.product_link || ""}
Notes from admin: ${deal.notes || ""}

ALLOWED STORES
--------------
${storeList}

ALLOWED CATEGORIES & SUB-CATEGORIES
-----------------------------------
${categoryTree}

TASKS
-----
1. Create a concise English deal title (max 80 characters).
2. Write an English deal description (60–120 words).
3. Create a Spanish deal title.
4. Write a Spanish deal description.
5. Select ONE category from the allowed list.
6. Select ONE sub-category that belongs to the category.
7. Generate 5–6 relevant hash tags.
8. Calculate an AI quality score (0–100).
9. Provide a score breakdown.
10. If store name is missing, infer the store ONLY by matching the product URL domain
    against the allowed store list.
    - Do NOT invent new store names
    - If no confident match exists, return null



RESPONSE FORMAT (JSON ONLY)
---------------------------
{
"store_name": null,
  "title_en": "",
  "body_en": "",
  "title_es": "",
  "body_es": "",
  "category": "",
  "sub_category": "",
  "hash_tags": [],
  "ai_score": 0,
  "ai_score_breakdown": {
    "completeness": 0,
    "clarity": 0,
    "deal_strength": 0,
    "category_relevance": 0,
    "seo_readiness": 0
  }
    
}
`;

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

  
   const parsed = safeJsonParse(ai.choices[0].message.content || "");

const metrics = computeMetrics(deal.old_price, deal.current_price);

const aiStatus =
  parsed.ai_score >= AI_SCORE_THRESHOLD ? "success" : "warning";

const updatePayload = {
  description: parsed.title_en,
  notes: parsed.body_en,
  description_es: parsed.title_es,
  notes_es: parsed.body_es,
  slug_es: slugify(parsed.title_es),

  category: parsed.category,
  sub_category: parsed.sub_category,
  hash_tags: parsed.hash_tags,
store_name: deal.store_name || parsed.store_name,

  ...metrics,

  ai_score: parsed.ai_score,
  ai_score_breakdown: parsed.ai_score_breakdown,
  ai_status: aiStatus,
  ai_generated_at: new Date().toISOString(),
  ai_error:
    aiStatus === "warning"
      ? "AI score below recommended threshold"
      : null,
};

/* ---------- PREVIEW MODE ---------- */
if (preview === true) {
  return NextResponse.json({
    ok: true,
    suggested: updatePayload,
  });
}

/* ---------- SAVE MODE ONLY ---------- */
await supabaseAdmin
  .from("deals")
  .update(updatePayload)
  .eq("id", dealId);

return NextResponse.json({
  ok: true,
  ai_status: aiStatus,
});




  } catch (err: any) {
    await supabaseAdmin.from("deals").update({
      ai_status: "error",
      ai_error: err.message || "AI processing failed",
    }).eq("id", dealId);

    return NextResponse.json({ error: err.message }, { status: 500 });

    
  }
  
}
