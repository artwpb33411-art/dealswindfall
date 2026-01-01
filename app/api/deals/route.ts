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
    .slice(0, 120);
}

function computeMetrics(oldP: number | null, currP: number | null) {
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

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000")
  );
}

/* -------------------------------------------------------------
   POST → Create Deal
------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ai_requested = true, description } = body;

    if (!description?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const current_price = body.currentPrice ? Number(body.currentPrice) : null;
    const old_price = body.oldPrice ? Number(body.oldPrice) : null;
    const metrics = computeMetrics(old_price, current_price);

    const payload = {
      description,
      notes: body.notes || "",
      description_es: body.description_es || description,
      notes_es: body.notes_es || body.notes || "",

      store_name: body.storeName || null,
      category: body.category || null,

      current_price,
      old_price,
      ...metrics,

      image_link: body.imageLink || null,
      product_link: body.productLink || null,
      review_link: body.reviewLink || null,
      coupon_code: body.couponCode || null,
      shipping_cost: body.shippingCost || null,
      expire_date: body.expireDate || null,
      holiday_tag: body.holidayTag || null,

      slug: slugify(description),
      slug_es: slugify(body.description_es || description),

      status: "Draft",
      ai_status: ai_requested ? "pending" : "skipped",
      published_at: null,
    };

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget AI
    if (ai_requested) {
      fetch(`${getBaseUrl()}/api/ai/process-deal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: data.id }),
      }).catch(console.error);
    }

    return NextResponse.json({ ok: true, deal: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Create failed" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------
   GET → Fetch Deals
------------------------------------------------------------- */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("deals")
    .select("*")
   .order("id", { ascending: false });


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/* -------------------------------------------------------------
   PUT → Update Deal (Edit)
------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing deal ID" }, { status: 400 });
    }

    const current_price =
      fields.current_price !== undefined
        ? Number(fields.current_price)
        : undefined;

    const old_price =
      fields.old_price !== undefined ? Number(fields.old_price) : undefined;

    const metrics = computeMetrics(
      old_price ?? body.old_price,
      current_price ?? body.current_price
    );

    const update: any = {
      ...fields,
      ...metrics,
    };

    if (fields.description) {
      update.slug = slugify(fields.description);
    }
    if (fields.description_es) {
      update.slug_es = slugify(fields.description_es);
    }

    if (status === "Published") {
      update.status = "Published";
      update.published_at = new Date().toISOString();
    }
    if (status === "Draft") {
      update.status = "Draft";
      update.published_at = null;
    }

    const { data, error } = await supabaseAdmin
      .from("deals")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, updated: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------
   DELETE → Delete Deal
------------------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing deal ID" }, { status: 400 });
    }

    await supabaseAdmin.from("deal_related_links").delete().eq("deal_id", id);
    const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}