import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ MUST await params in Next.js 16
  const { id } = await context.params;
  const dealId = Number(id);

  if (Number.isNaN(dealId)) {
    return NextResponse.json({ count: 0 });
  }

  const { count, error } = await supabaseAdmin
    .from("deal_page_views")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId)
    .gte(
      "created_at",
      new Date(Date.now() - 60 * 60 * 1000).toISOString()
    );

  if (error) {
    console.error("views-last-hour error", error);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
