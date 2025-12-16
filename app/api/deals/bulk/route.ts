import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");
}

export async function POST(req: Request) {
  const { deals, useAI } = await req.json();
  if (!Array.isArray(deals) || deals.length === 0) {
    return NextResponse.json({ error: "No deals provided" }, { status: 400 });
  }

  const rows = deals.map(d => ({
    description: d.description,
    notes: d.notes || "",
    description_es: d.description_es || d.description,
    notes_es: d.notes_es || d.notes || "",
    store_name: d.store_name || null,
    category: d.category || null,
    current_price: d.current_price || null,
    old_price: d.old_price || null,
    slug: slugify(d.description),
    ai_status: useAI ? "pending" : "skipped",
    published_at: new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin.from("deals").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (useAI) {
    const base = getBaseUrl();
    for (const deal of data) {
      fetch(`${base}/api/ai/process-deal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id }),
      }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true, inserted: data.length });
}
