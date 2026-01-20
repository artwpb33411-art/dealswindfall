// app/api/social/preview/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeDeal } from "@/lib/social/normalizeDeal";
import { safeGenerateFlyers } from "@/lib/social/safeGenerateFlyers";
import { buildCaption, buildPlatformCaptions } from "@/lib/social/captionBuilder";

export async function GET() {
  // 1️⃣ Get latest published deal (or accept ?id=)
  const { data: raw, error } = await supabaseAdmin
    .from("deals")
    .select("*")
    .eq("status", "Published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !raw) {
    return NextResponse.json({ error: "No deal found" }, { status: 404 });
  }

  // 2️⃣ Normalize (THIS FIXES YOUR PRICE ISSUE)
  const deal = normalizeDeal(raw);

  // 3️⃣ Generate flyers
  const flyers = await safeGenerateFlyers(deal);

  // 4️⃣ Generate captions
  const social = buildCaption(deal, []);
  const platform = buildPlatformCaptions(deal, [], "en");

  return NextResponse.json({
    deal: {
      id: deal.id,
      title: deal.title,
      price: deal.price,
      percent_diff: deal.percent_diff,
    },
    flyers: {
      portrait: flyers.portrait.toString("base64"),
      square: flyers.square.toString("base64"),
      story: flyers.story.toString("base64"),
    },
    captions: {
      facebook: platform.captions.facebook.text,
      instagram: social.text,
      telegram: social.text,
      x: social.short,
    },
  });
}
