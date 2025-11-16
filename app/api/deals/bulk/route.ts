import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { deals } = await req.json();

    if (!deals || !Array.isArray(deals) || deals.length === 0)
      throw new Error("No deals provided.");

    const prepared = deals.map((d) => {
      // ---- Handle Numbers ----
      const oldP = d.old_price ? Number(d.old_price) : null;
      const currP = d.current_price ? Number(d.current_price) : null;

      const priceDiff =
        oldP !== null && currP !== null ? oldP - currP : null;

      const percentDiff =
        oldP ? Number(((priceDiff / oldP) * 100).toFixed(2)) : null;

      let dealLevel = "";
      if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
      else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
      else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
      else if (percentDiff >= 71) dealLevel = "Flaming deal";

      // ---- Handle expire_date ----
      let expireDate = null;

      if (d.expire_date) {
        if (typeof d.expire_date === "string" && d.expire_date.trim() !== "") {
          expireDate = new Date(d.expire_date).toISOString();
        } 
        else if (d.expire_date instanceof Date) {
          expireDate = d.expire_date.toISOString();
        }
      }

      return {
        description: d.description || null,
        store_name: d.store_name || null,
        category: d.category || null,
        old_price: oldP,
        current_price: currP,
        price_diff: priceDiff,
        percent_diff: percentDiff,
        deal_level: dealLevel,
        image_link: d.image_link || null,
        product_link: d.product_link || null,
        coupon_code: d.coupon_code || null,
        shipping_cost: d.shipping_cost || null,
        notes: d.notes || null,
        expire_date: expireDate,
        holiday_tag: d.holiday_tag || null,
        published_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert(prepared)
      .select();

    if (error) throw error;

    return NextResponse.json({ ok: true, inserted: data.length });
  } catch (err: any) {
    console.error("Bulk upload error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error during bulk upload." },
      { status: 500 }
    );
  }
}
