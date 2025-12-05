import { NextResponse } from "next/server";
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

function extractUrls(text: string) {
  return text?.match(/https?:\/\/[^\s]+/g) || [];
}

/* -------------------------------------------------------------
   SANITIZE TEXT (Fixes all Excel weird characters)
------------------------------------------------------------- */
function sanitizeText(text: string) {
  if (!text) return "";

  return text
    .replace(/[\u201C\u201D]/g, '"')    // smart quotes → "
    .replace(/[\u2018\u2019]/g, "'")   // curly apostrophes → '
    .replace(/[\u2013\u2014]/g, "-")   // en/em dash → hyphen
    .replace(/[™®]/g, "")              // remove trademark symbols
    .replace(/\s+/g, " ")              // collapse spaces
    .trim();
}

function computeMetrics(oldP: number, currP: number) {
  if (!oldP || !currP || oldP <= 0 || currP <= 0) {
    return { price_diff: null, percent_diff: null, deal_level: null };
  }

  const priceDiff = oldP - currP;
  const percentDiff = Number(((priceDiff / oldP) * 100).toFixed(2));

  let dealLevel = "";
  if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
  else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
  else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
  else if (percentDiff >= 71) dealLevel = "Flaming deal";

  return { price_diff: priceDiff, percent_diff: percentDiff, deal_level: dealLevel || null };
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return "http://localhost:3000";
}


/* -------------------------------------------------------------
   BULK API ROUTE
------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    let deals = [];
let useAI = false;

try {
  // Try JSON first (when frontend sends JSON)
  const body = await req.json();
  deals = body.deals;
  useAI = body.useAI;
} catch (err) {
  // If JSON fails, try formdata (happens with file uploads)
  const form = await req.formData();
  const file = form.get("file");

  if (!file) {
    return NextResponse.json(
      { error: "Invalid upload format. Expected JSON or file upload." },
      { status: 400 }
    );
  }

  // Parse CSV/Excel here...
  // I can write that code if you tell me the file format.
}


    if (!Array.isArray(deals) || deals.length === 0) {
      return NextResponse.json({ error: "No deals provided." }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const finalRows: any[] = [];
    const linksToInsert: any[] = [];

    /* ---------------------------------------------------------
       LOOP EACH DEAL
    --------------------------------------------------------- */
    for (const raw of deals) {
      // Normalize + sanitize text
      const title = sanitizeText(
        raw.description || raw.title || raw.Title || ""
      );

      const notes = sanitizeText(
        raw.notes || raw.description_text || raw.Description || ""
      );

      const store_name = raw.store_name || raw.store || raw.Store || null;
      const category = raw.category || raw.Category || null;

      const current_price = Number(raw.current_price ?? raw.currentPrice ?? 0);
      const old_price = Number(raw.old_price ?? raw.oldPrice ?? 0);

      const image_link = raw.image_link || raw.imageLink || null;
      const product_link = raw.product_link || raw.productLink || null;
      const review_link = raw.review_link || raw.reviewLink || null;
      const coupon_code = raw.coupon_code || raw.couponCode || null;
      const shipping_cost = raw.shipping_cost || raw.shippingCost || null;
      const expire_date = raw.expire_date || raw.expireDate || null;
      const holiday_tag = raw.holiday_tag || raw.holidayTag || null;

      let description_es = raw.description_es || "";
      let notes_es = raw.notes_es || "";

      /* ---------------------------------------------------------
         AI FULL SEO REWRITE (EN + ES)
      --------------------------------------------------------- */
      if (useAI && title.trim()) {
       try {
console.log("🧪 AI REQUEST BODY:", {
  title,
  notes,
  storeName: store_name,
  category,
  currentPrice: current_price,
  oldPrice: old_price,
  shippingCost: shipping_cost,
  couponCode: coupon_code,
  holidayTag: holiday_tag,
  productLink: product_link,
});

const res = await fetch(`${baseUrl}/api/ai-generate-seo`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title,
    notes,
    storeName: store_name,
    category,
    currentPrice: current_price,
    oldPrice: old_price,
    shippingCost: shipping_cost,
    couponCode: coupon_code,
    holidayTag: holiday_tag,
    productLink: product_link,
  }),
});

const data = await res.json();

console.log("🧪 AI RESPONSE:", data);


          if (data.success) {
            raw.description = data.title_en;
            raw.notes = data.description_en;
            description_es = data.title_es;
            notes_es = data.description_es;
          } else {
            if (!description_es) description_es = title;
            if (!notes_es) notes_es = notes;
          }

        } catch (err) {
          console.error("❌ Bulk AI error:", err);
          if (!description_es) description_es = title;
          if (!notes_es) notes_es = notes;
        }
      } else {
        if (!description_es) description_es = title;
        if (!notes_es) notes_es = notes;
      }

      /* ---------------------------------------------------------
         SLUGS + METRICS
      --------------------------------------------------------- */
      const metrics = computeMetrics(old_price, current_price);
      const slug = slugify(raw.description || title || "deal");
      const slug_es = slugify(description_es || slug);

      /* ---------------------------------------------------------
         FINALIZED ROW
      --------------------------------------------------------- */
      const row = {
        description: raw.description || title,
        notes: raw.notes || notes,
        description_es,
        notes_es,

        current_price,
        old_price,
        price_diff: metrics.price_diff,
        percent_diff: metrics.percent_diff,
        deal_level: metrics.deal_level,

        store_name,
        category,

        image_link,
        product_link,
        review_link,
        coupon_code,
        shipping_cost,
        expire_date,
        holiday_tag,

        slug,
        slug_es,
        published_at: new Date().toISOString(),
      };

      finalRows.push(row);

      /* ---------------------------------------------------------
         Related URLs extraction
      --------------------------------------------------------- */
      const urls = extractUrls(row.notes || "");
      for (const url of urls) {
        linksToInsert.push({ url, deal_id_placeholder: true });
      }
    }

    /* -------------------------------------------------------------
       INSERT INTO SUPABASE
    ------------------------------------------------------------- */
    const { data: inserted, error } = await supabaseAdmin
      .from("deals")
      .insert(finalRows)
      .select();

    if (error) throw error;

    /* -------------------------------------------------------------
       MAP LINKS TO DEAL IDs
    ------------------------------------------------------------- */
    let pos = 0;
    for (let i = 0; i < inserted.length; i++) {
      const deal = inserted[i];
      const urls = extractUrls(finalRows[i].notes || "");

      for (let j = 0; j < urls.length; j++) {
        linksToInsert[pos].deal_id = deal.id;
        delete linksToInsert[pos].deal_id_placeholder;
        pos++;
      }
    }

    if (linksToInsert.length > 0) {
      await supabaseAdmin.from("deal_related_links").insert(linksToInsert);
    }

    return NextResponse.json(
      {
        ok: true,
        inserted: inserted.length,
        links: linksToInsert.length,
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ BULK UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error during bulk upload." },
      { status: 500 }
    );
  }
}
