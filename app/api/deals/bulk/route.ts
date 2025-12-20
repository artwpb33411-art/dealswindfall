import { NextResponse } from "next/server";

type BulkRowResult = {
  index: number;
  result: string;
  message: string;
  deal_id?: number;
  existing_deal_id?: number;
};

export async function POST(req: Request) {
  try {
    const { deals, useAI } = await req.json();

    if (!Array.isArray(deals) || deals.length === 0) {
      return NextResponse.json(
        { error: "No deals provided" },
        { status: 400 }
      );
    }

    const results: BulkRowResult[] = [];

    let summary = {
      total: deals.length,
      inserted: 0,
      bumped: 0,
      superseded: 0,
      skipped: 0,
      errors: 0,
    };

    for (let i = 0; i < deals.length; i++) {
      const row = deals[i];

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/deals/ingest`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...row,
              ai_requested: useAI,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          summary.errors++;
          results.push({
            index: i + 1,
            result: "error",
            message: data.message || "Failed",
          });
          continue;
        }

        switch (data.result) {
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
          index: i + 1,
          result: data.result,
          message: data.message,
          deal_id: data.deal_id,
          existing_deal_id: data.existing_deal_id,
        });
      } catch (err: any) {
        summary.errors++;
        results.push({
          index: i + 1,
          result: "error",
          message: err.message || "Unexpected error",
        });
      }
    }

    return NextResponse.json({
      summary,
      rows: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bulk ingest failed" },
      { status: 500 }
    );
  }
}
