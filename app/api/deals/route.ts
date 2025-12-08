import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------
   OPENAI (try OPENAI_API_KEY, fallback CHATGPT_API_KEY)
------------------------------------------------------------- */
const openaiApiKey =
  process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY || "";

const hasOpenAIKey = !!openaiApiKey;

const openai = new OpenAI({
  apiKey: openaiApiKey || "dummy", // won't be used if hasOpenAIKey = false
});

/* -------------------------------------------------------------
   Supabase Clients
------------------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/* -------------------------------------------------------------
   Helper: Slugify
------------------------------------------------------------- */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

/* -------------------------------------------------------------
   Helper: Extract URLs from notes
------------------------------------------------------------- */
function extractUrls(text: string) {
  return text?.match(/https?:\/\/[^\s]+/g) || [];
}

/* -------------------------------------------------------------
   Helper: Get Page Title from URL
------------------------------------------------------------- */
function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000"
  );
}

async function getTitle(url: string) {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/fetch-title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch (err) {
    console.error("❌ getTitle failed:", err);
    return null;
  }
}

/* -------------------------------------------------------------
   Helper: Deal level & discount
------------------------------------------------------------- */
function computeDealMetrics(oldPrice: number, currentPrice: number) {
  if (!oldPrice || !currentPrice || oldPrice <= 0 || currentPrice <= 0) {
    return { price_diff: null, percent_diff: null, deal_level: null };
  }

  const priceDiff = oldPrice - currentPrice;
  const percentDiff = Number(((priceDiff / oldPrice) * 100).toFixed(2));

  let dealLevel = "";
  if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
  else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
  else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
  else if (percentDiff >= 71) dealLevel = "Flaming deal";

  return {
    price_diff: priceDiff,
    percent_diff: percentDiff,
    deal_level: dealLevel || null,
  };
}

/* -------------------------------------------------------------
   POST → Create a NEW deal (with AI ES if needed)
------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      description, // EN title
      notes,       // EN description
      description_es, // optional ES title
      notes_es,       // optional ES description
      category,
      storeName,
      currentPrice,
      oldPrice,
      shippingCost,
      couponCode,
      holidayTag,
      productLink,
      reviewLink,
      imageLink,
      expireDate,
    } = body;

    if (!description || description.trim() === "") {
      return NextResponse.json(
        { error: "Missing English title." },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       AI GENERATION — ONLY IF Spanish not provided
    ------------------------------------------------------- */
    let finalTitleEs = description_es || "";
    let finalNotesEs = notes_es || "";

    if (hasOpenAIKey && (!finalTitleEs || !finalNotesEs)) {
      const productText = `
English Title: ${description}
English Description: ${notes || ""}
Category: ${category || ""}
Store: ${storeName || ""}
Price: ${currentPrice} (old: ${oldPrice})
Shipping: ${shippingCost || ""}
Coupon: ${couponCode || ""}
Holiday/Event: ${holidayTag || ""}
Product Link: ${productLink || ""}
`;

      try {
        const ai = await openai.responses.create({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          input: `
Translate and rewrite the following product into professional Spanish SEO content.
Return ONLY this JSON:

{
  "title_es": "",
  "description_es": ""
}

${productText}
          `,
        });

        const raw = (ai as any).output_text || "";
        const cleaned = raw
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        finalTitleEs = parsed.title_es || description;
        finalNotesEs = parsed.description_es || notes || "";
      } catch (err) {
        console.error("AI ES generation failed, falling back:", err);
        // fallback: copy EN into ES fields
        finalTitleEs = description;
        finalNotesEs = notes || "";
      }
    } else {
      // if no key or Spanish already provided, just use what we have / copy EN
      if (!finalTitleEs) finalTitleEs = description;
      if (!finalNotesEs) finalNotesEs = notes || "";
    }

    /* -------------------------------------------------------
       Compute deal metrics
    ------------------------------------------------------- */
    const oldNum = oldPrice ? Number(oldPrice) : 0;
    const currNum = currentPrice ? Number(currentPrice) : 0;
    const metrics = computeDealMetrics(oldNum, currNum);

    /* -------------------------------------------------------
       Create SLUGS
    ------------------------------------------------------- */
    const slug = slugify(description);
    const slug_es = slugify(finalTitleEs);

    /* -------------------------------------------------------
       Prepare FINAL payload (snake_case)
    ------------------------------------------------------- */
    const payload: any = {
      description,
      notes: notes || "",
      description_es: finalTitleEs,
      notes_es: finalNotesEs,

      current_price: currentPrice ? Number(currentPrice) : null,
      old_price: oldPrice ? Number(oldPrice) : null,
      store_name: storeName || null,
      image_link: imageLink || null,
      product_link: productLink || null,
      review_link: reviewLink || null,
      coupon_code: couponCode || null,
      shipping_cost: shippingCost || null,
      expire_date: expireDate || null,
      category: category || null,
      holiday_tag: holidayTag || null,

      slug,
      slug_es,
      published_at: new Date().toISOString(),

      price_diff: metrics.price_diff,
      percent_diff: metrics.percent_diff,
      deal_level: metrics.deal_level,
    };

    /* -------------------------------------------------------
       Insert DEAL
    ------------------------------------------------------- */
    const { data: deal, error } = await supabase
      .from("deals")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    /* -------------------------------------------------------
       Extract URLs from notes → related links
    ------------------------------------------------------- */
    const urls = extractUrls(notes || "");
    if (urls.length > 0) {
      const titleResults = await Promise.all(urls.map((u) => getTitle(u)));
      const rows = urls.map((url, i) => ({
        deal_id: deal.id,
        url,
        title: titleResults[i] || null,
      }));

      await supabaseAdmin.from("deal_related_links").insert(rows);
    }

    return NextResponse.json(deal, { status: 200 });
  } catch (err: any) {
    console.error("DEALS POST error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------
   GET → Fetch ALL deals
------------------------------------------------------------- */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("GET /deals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* -------------------------------------------------------------
   PUT → Update existing deal (handle snake + camel + publish logic)
------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, ...updateFields } = body;

    if (!id) throw new Error("Missing deal ID.");

    /* ---------------------------------------------------------
       UNIFIED CAMEL → SNAKE CASE MAPPING
    --------------------------------------------------------- */
    const fieldMap: Record<string, string> = {
      currentPrice: "current_price",
      oldPrice: "old_price",
      storeName: "store_name",
      imageLink: "image_link",
      productLink: "product_link",
      reviewLink: "review_link",
      couponCode: "coupon_code",
      shippingCost: "shipping_cost",
      expireDate: "expire_date",
      holidayTag: "holiday_tag",
    };

    for (const key in fieldMap) {
      if (key in updateFields) {
        const newKey = fieldMap[key];

        // Convert number fields properly
        if (
          key === "currentPrice" ||
          key === "oldPrice" ||
          key === "shippingCost"
        ) {
          updateFields[newKey] = Number(updateFields[key]);
        } else {
          updateFields[newKey] = updateFields[key];
        }

        delete updateFields[key];
      }
    }

    /* ---------------------------------------------------------
       STATUS LOGIC — Manual Publish / Unpublish
    --------------------------------------------------------- */
    if (status === "Published") {
      updateFields.status = "Published";
      updateFields.published_at = new Date().toISOString();
    } else if (status === "Draft") {
      updateFields.status = "Draft";
      updateFields.published_at = null;
    }

    /* ---------------------------------------------------------
       RECOMPUTE PRICE METRICS
    --------------------------------------------------------- */

    // Detect if prices exist (either from updateFields OR original body)
    const oldP =
      updateFields.old_price !== undefined
        ? Number(updateFields.old_price)
        : Number(body.old_price ?? 0);

    const currP =
      updateFields.current_price !== undefined
        ? Number(updateFields.current_price)
        : Number(body.current_price ?? 0);

    if (!isNaN(oldP) && !isNaN(currP) && oldP > 0 && currP > 0) {
      const diff = oldP - currP;
      const percent = Number(((diff / oldP) * 100).toFixed(2));

      let level = null;
      if (percent >= 40 && percent < 51) level = "Blistering deal";
      else if (percent >= 51 && percent < 61) level = "Scorching deal";
      else if (percent >= 61 && percent < 71) level = "Searing deal";
      else if (percent >= 71) level = "Flaming deal";

      updateFields.price_diff = diff;
      updateFields.percent_diff = percent;
      updateFields.deal_level = level;
    }

    /* ---------------------------------------------------------
       UPDATE in Supabase
    --------------------------------------------------------- */
    const { data, error } = await supabaseAdmin
      .from("deals")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, updated: data });
  } catch (err: any) {
    console.error("PUT /deals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


/* -------------------------------------------------------------
   DELETE → Delete existing deal
------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) throw new Error("Missing deal ID");

    // Delete related links
    await supabaseAdmin.from("deal_related_links").delete().eq("deal_id", id);

    // Delete main deal
    await supabaseAdmin.from("deals").delete().eq("id", id);

    return NextResponse.json({ ok: true, message: "Deal deleted" });
  } catch (err: any) {
    console.error("DELETE /deals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
