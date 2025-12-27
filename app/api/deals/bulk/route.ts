import { normalizeText } from "@/lib/normalizeText";


import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BulkRowResult = {
  row: number;
  result: "inserted" | "bumped_existing" | "superseded_old" | "skipped_duplicate" | "error";
  message: string;
  deal_id?: number;
  existing_deal_id?: number;
  ai_status?: string;
};
function getOrigin(req: Request) {
  const url = new URL(req.url);
  return url.origin;
}



export async function POST(req: Request) {
  try {

    const origin = new URL(req.url).origin;
    const { deals, useAI } = await req.json();

    if (!Array.isArray(deals) || deals.length === 0) {
      return NextResponse.json({ error: "No deals provided" }, { status: 400 });
    }

    const results: BulkRowResult[] = [];

    const summary = {
      total: deals.length,
      inserted: 0,
      bumped: 0,
      superseded: 0,
      skipped: 0,
      errors: 0,
    };

    for (let i = 0; i < deals.length; i++) {
      const row = deals[i];

      // --- Normalize CSV/XLSX keys ---
     const payload = {
  // title (strict)
  description: normalizeText(row.description || row.Description),

  // ✅ notes (loose / raw)
  notes: typeof row.notes === "string"
    ? row.notes.trim()
    : row.Notes ?? null,

  notes_es: typeof row.notes_es === "string"
    ? row.notes_es.trim()
    : null,

  productLink:
    row.productLink || row.product_link || row["Product Link"],

  currentPrice: row.currentPrice || row.current_price,
  oldPrice: row.oldPrice || row.old_price,

  storeName: normalizeText(row.storeName || row.store_name),
  category: normalizeText(row.category),
  holidayTag: normalizeText(row.holidayTag || row.holiday_tag),

  imageLink: row.imageLink || row.image_link,

  ai_requested: useAI,
};


      // --- Pre-validation ---
      if (!payload.description || !payload.productLink) {
        summary.errors++;
        results.push({
          row: i + 1,
          result: "error",
          message: "Missing description or productLink",
        });
        continue;
      }

      try {
  const ingestUrl = new URL("/api/deals/ingest", req.url);
/*
const ingestRes = await fetch(ingestUrl.toString(), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
*/


const ingestRes = await fetch(new URL("/api/deals/ingest", req.url), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    cookie: req.headers.get("cookie") ?? "",
    authorization: req.headers.get("authorization") ?? "",
  },
  body: JSON.stringify(payload),
});


let ingestData: any;
const text = await ingestRes.text();

try {
  ingestData = JSON.parse(text);
} catch {
  console.error("INGEST returned non-JSON. status=", ingestRes.status);
  console.error("INGEST non-JSON snippet:", text.slice(0, 300)); // 👈 important

  summary.errors++;
  results.push({
    row: i + 1,
    result: "error",
    message: "Ingest crashed (non-JSON response)",
  });
  continue;
}


if (!ingestRes.ok) {
  summary.errors++;
  results.push({
    row: i + 1,
    result: "error",
    message: ingestData.message || "Ingest failed",
  });
  continue;
}


switch (ingestData.result) {
  case "inserted":
    summary.inserted++;
    break;
  case "bumped_existing":
    summary.bumped++;
    break;
  case "superseded_old":
    summary.superseded++;
    break;
  case "skipped_duplicate":
    summary.skipped++;
    break;
}

results.push({
  row: i + 1,
  result: ingestData.result,
  message: ingestData.message || "",
  deal_id: ingestData.deal_id ?? null,
  existing_deal_id: ingestData.existing_deal_id ?? null,
  ai_status: useAI ? "pending" : "skipped",
});

      } catch (err: any) {
        summary.errors++;
        results.push({
          row: i + 1,
          result: "error",
          message: err.message || "Unexpected error",
        });
      }
    }
console.log("Bulk ingest origin:", origin);

    return NextResponse.json({ summary, rows: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bulk ingest failed" },
      { status: 500 }
    );
  }
}
