import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

/** Detect if a deal is already optimized */
function isOptimized(deal: any) {
  return (
    deal.description_es &&
    deal.notes_es &&
    deal.slug &&
    deal.slug_es &&
    deal.description_es.length > 5 &&
    deal.notes_es.length > 5
  );
}

/** Logs progress to Vercel/console */
function log(msg: string) {
  console.log("🟦 REPROCESS:", msg);
}

async function processDeal(baseUrl: string, deal: any, index: number, total: number) {
  log(`Processing deal ${index + 1}/${total} (ID: ${deal.id})`);

  // Skip already AI-optimized deals
  if (isOptimized(deal)) {
    log(`➡️  Skipped (already optimized): ID ${deal.id}`);
    return null;
  }

  // Retry up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/ai-generate-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: deal.description,
          notes: deal.notes,
          storeName: deal.store_name,
          category: deal.category,
          currentPrice: deal.current_price,
          oldPrice: deal.old_price,
          shippingCost: deal.shipping_cost,
          couponCode: deal.coupon_code,
          holidayTag: deal.holiday_tag,
          productLink: deal.product_link,
        }),
      });

      const text = await res.text();

      // Detect HTML (error page)
      if (text.startsWith("<!DOCTYPE")) {
        log(`⚠️ HTML error for deal ID ${deal.id} — skipping`);
        return null;
      }

      const data = JSON.parse(text);

      if (!data.success) {
        log(`⚠️ AI failure for ID ${deal.id} — skipping`);
        return null;
      }

      return {
        description: data.title_en,
        notes: data.description_en,
        description_es: data.title_es,
        notes_es: data.description_es,
        slug: slugify(data.title_en),
        slug_es: slugify(data.title_es),
      };

    } catch (err) {
      log(`❌ Attempt ${attempt}/3 failed for deal ID ${deal.id}`);

      if (attempt === 3) {
        log(`⛔ Giving up on deal ID ${deal.id}`);
        return null;
      }
    }
  }

  return null;
}

export async function GET() {
  try {
    const { data: deals, error } = await supabaseAdmin
      .from("deals")
      .select("*");

    if (error) throw error;

    const total = deals.length;
    let updated = 0;
    let skipped = 0;

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` ||
      "http://localhost:3000";

    log(`🚀 Starting reprocess | Total deals: ${total}`);

    for (let i = 0; i < total; i++) {
      const deal = deals[i];

      const result = await processDeal(baseUrl, deal, i, total);

      if (!result) {
        skipped++;
        continue;
      }

      await supabaseAdmin
        .from("deals")
        .update(result)
        .eq("id", deal.id);

      updated++;
      log(`✅ Updated deal ID ${deal.id}`);
    }

    log("🎉 Reprocess completed");
    log(`Updated: ${updated} | Skipped: ${skipped} | Total: ${total}`);

    return NextResponse.json({
      ok: true,
      updated,
      skipped,
      total,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return await GET();
}
