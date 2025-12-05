import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// tiny helper to slugify names
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* -------------------------------------------
   GET /api/holiday-events
   - ?active=true  -> only active events
   ------------------------------------------- */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get("active") === "true";

    let query = supabaseAdmin.from("holiday_events").select("*").order("start_date", {
      ascending: true,
    });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("GET /holiday-events error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to fetch holiday events" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------
   POST /api/holiday-events
   body: { name, is_active?, start_date?, end_date? }
   ------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();

    if (!name) throw new Error("Event name is required.");

    const slug = body.slug || slugify(name);

    const { data, error } = await supabaseAdmin
      .from("holiday_events")
      .insert({
        name,
        slug,
        is_active: !!body.is_active,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, event: data }, { status: 201 });
  } catch (e: any) {
    console.error("POST /holiday-events error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to create holiday event" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------
   PUT /api/holiday-events
   body: { id, ...fieldsToUpdate }
   ------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) throw new Error("Missing event ID for update.");

    if (fields.name && !fields.slug) {
      fields.slug = slugify(fields.name);
    }

    const { data, error } = await supabaseAdmin
      .from("holiday_events")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, event: data });
  } catch (e: any) {
    console.error("PUT /holiday-events error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to update holiday event" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------
   DELETE /api/holiday-events
   body: { id }
   ------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) throw new Error("Missing event ID for delete.");

    const { error } = await supabaseAdmin
      .from("holiday_events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /holiday-events error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to delete holiday event" },
      { status: 500 }
    );
  }
}
