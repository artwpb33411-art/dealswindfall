import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* -------------------------------------------------------------------------- */
/* 🟢 CREATE new catalog (POST) */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("catalogs")
      .insert({
        store_name: body.storeName ?? null,
        start_date: body.startDate ?? null,
        end_date: body.endDate ?? null,
        catalog_link: body.catalogLink ?? null,
        screenshot_link: body.screenshotLink ?? null,
        published_at: new Date().toISOString(), // ✅ added timestamp
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, catalog: data }, { status: 201 });
  } catch (e: any) {
    console.error("POST /catalogs error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 📋 READ all catalogs (GET) */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("catalogs")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("GET /catalogs error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE existing catalog (PUT) */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) throw new Error("Missing catalog ID for update.");

    const { data, error } = await supabaseAdmin
      .from("catalogs")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, updated: data });
  } catch (e: any) {
    console.error("PUT /catalogs error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE a catalog (DELETE) */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) throw new Error("Missing catalog ID for delete.");

    const { error } = await supabaseAdmin.from("catalogs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Catalog deleted" });
  } catch (e: any) {
    console.error("DELETE /catalogs error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
