import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { postDealToSocial } from "@/lib/social/postDealToSocial";
import { normalizeDeal } from "@/lib/social/normalizeDeal";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { deal_id, platforms } = await req.json();

  if (!deal_id) {
    return NextResponse.json(
      { error: "Missing deal_id" },
      { status: 400 }
    );
  }

  const { data: deal, error } = await supabaseAdmin
    .from("deals")
    .select("*")
    .eq("id", deal_id)
    .single();

  if (error || !deal) {
    return NextResponse.json(
      { error: "Deal not found" },
      { status: 404 }
    );
  }

  const enabledPlatforms =
    platforms?.length > 0
      ? platforms
      : ["x", "telegram", "facebook", "instagram"];

  const hashtags =
    Array.isArray(deal.hash_tags) ? deal.hash_tags : [];
const normalizedDeal = normalizeDeal(deal);


const result = await postDealToSocial({
  deal: normalizedDeal,
  platforms: enabledPlatforms,
  hashtags,
  force: true,
});


  return NextResponse.json({
    success: true,
    deal_id,
    ...result,
  });
}
