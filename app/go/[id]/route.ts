import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  // ✅ IMPORTANT: params must be awaited in Next.js 16
  const { id } = await ctx.params;

  const dealId = Number(id);
  if (Number.isNaN(dealId)) {
    return NextResponse.redirect("http://localhost:3000");
  }

  const { data, error } = await supabase
    .from("deals")
    .select("product_link")
    .eq("id", dealId)
    .maybeSingle();

  if (error || !data?.product_link) {
    return NextResponse.redirect("http://localhost:3000");
  }

  return NextResponse.redirect(data.product_link, 302);
}
