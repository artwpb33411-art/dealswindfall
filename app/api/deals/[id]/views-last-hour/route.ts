import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const dealId = Number(params.id);
  if (Number.isNaN(dealId)) {
    return NextResponse.json({ count: 0 });
  }

  // ✅ Use DB time, not JS time
  const { data, error } = await supabaseAdmin
    .rpc("get_deal_views_last_hour", { p_deal_id: dealId });

  if (error) {
    console.error("views-last-hour error", error);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: data ?? 0 });
}
