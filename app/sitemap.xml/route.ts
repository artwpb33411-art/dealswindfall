export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");

  // 1️⃣ Count published canonical deals
  const { count, error } = await supabaseAdmin
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("status", "Published")
    .is("superseded_by_id", null)
    .is("canonical_to_id", null);

  if (error) {
    console.error("Sitemap count error:", error);
  }

  const totalDeals = count || 0;
  const pageSize = 1000;
  const totalPages = Math.max(1, Math.ceil(totalDeals / pageSize));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 2️⃣ Deal sitemap pages
  for (let i = 1; i <= totalPages; i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-deals/${i}.xml</loc>
  </sitemap>`;
  }

  // 3️⃣ Static + blog sitemaps
  xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
  </sitemap>`;

  xml += `\n</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
