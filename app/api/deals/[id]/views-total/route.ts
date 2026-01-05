import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dealId = Number(id);

  if (Number.isNaN(dealId)) {
    return NextResponse.json(
      { error: "Invalid deal id" },
      { status: 400 }
    );
  }

  const { count, error } = await supabaseAdmin
    .from("deal_page_views")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId);

  if (error) {
    console.error("views-total error:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    total: count ?? 0,
  });
}
