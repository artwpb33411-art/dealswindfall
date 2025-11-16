import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------------------- */
/* 🟢 CREATE a new deal (POST) */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const oldP = parseFloat(body.old_price || body.oldPrice || 0);
    const currP = parseFloat(body.current_price || body.currentPrice || 0);
    const priceDiff = oldP && currP ? oldP - currP : 0;
    const percentDiff = oldP ? Number(((priceDiff / oldP) * 100).toFixed(2)) : 0;

    let dealLevel = "";
    if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
    else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
    else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
    else if (percentDiff >= 71) dealLevel = "Flaming deal";

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert({
        description: body.description ?? "",
        current_price: currP || null,
        old_price: oldP || null,
        price_diff: priceDiff || null,
        percent_diff: percentDiff || null,
        image_link: body.imageLink ?? null,
        product_link: body.productLink ?? null,
        review_link: body.reviewLink ?? null,
        coupon_code: body.couponCode ?? null,
        shipping_cost: body.shippingCost ? Number(body.shippingCost) : null,
        notes: body.notes ?? null,
        expire_date: body.expireDate ?? null,
        category: body.category ?? null,
        store_name: body.storeName ?? null,
        deal_level: dealLevel,
		holiday_tag: body.holidayTag ?? null,   // 👈 NEW
        published_at: new Date().toISOString(), // ✅ added timestamp
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, deal: data }, { status: 201 });
  } catch (e: any) {
    console.error("POST /deals error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 📋 READ all deals (GET) */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("GET /deals error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE existing deal (PUT) */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) throw new Error("Missing deal ID for update.");

    const { data, error } = await supabaseAdmin
      .from("deals")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, updated: data });
  } catch (e: any) {
    console.error("PUT /deals error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE a deal (DELETE) */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) throw new Error("Missing deal ID for delete.");

    const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Deal deleted" });
  } catch (e: any) {
    console.error("DELETE /deals error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
