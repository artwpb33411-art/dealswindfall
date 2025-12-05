import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------------------- */
/* 🟢 CREATE new coupon (POST) */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        store_name: body.storeName ?? null,
        coupon_link: body.couponLink ?? null,
        expiration_date: body.expirationDate ?? null,
        published_at: new Date().toISOString(),
        category: body.category ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, coupon: data }, { status: 201 });
  } catch (e: any) {
    console.error("POST /coupons error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 📋 READ all coupons (GET) */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("GET /coupons error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE existing coupon (PUT) */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) throw new Error("Missing coupon ID for update.");

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, updated: data });
  } catch (e: any) {
    console.error("PUT /coupons error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE coupon (DELETE) */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) throw new Error("Missing coupon ID for delete.");

    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Coupon deleted" });
  } catch (e: any) {
    console.error("DELETE /coupons error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
