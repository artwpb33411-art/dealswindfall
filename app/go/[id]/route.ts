import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getBaseUrl(req: Request) {
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function isInAppBrowser(ua: string) {
  return (
    ua.includes("FBAN") ||
    ua.includes("FBAV") ||
    ua.includes("Instagram") ||
    ua.includes("WhatsApp") ||
    ua.includes("Telegram") ||
    ua.includes("Line") ||
    ua.includes("Twitter") ||
    ua.includes("LinkedIn")
  );
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const dealId = Number(id);

  const baseUrl = getBaseUrl(req);

  if (Number.isNaN(dealId)) {
    return NextResponse.redirect(baseUrl, 302);
  }

  const { data, error } = await supabase
    .from("deals")
    .select("product_link")
    .eq("id", dealId)
    .maybeSingle();

  if (error || !data?.product_link) {
    return NextResponse.redirect(baseUrl, 302);
  }

  const ua = req.headers.get("user-agent") || "";
  const inApp = isInAppBrowser(ua);

  // 🔑 Redirect social/in-app browsers to confirmation page
  if (inApp) {
    return NextResponse.redirect(
      `${baseUrl}/go/${dealId}/open`,
      302
    );
  }
const url = new URL(req.url);
const force = url.searchParams.has("force");

// If user explicitly confirmed → go to Amazon no matter what
if (force) {
  return NextResponse.redirect(data.product_link, 302);
}

  // ✅ Normal browsers → direct merchant redirect
  return NextResponse.redirect(data.product_link, 302);
}
