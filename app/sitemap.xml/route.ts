export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  /* -------------------------------------------------------------
      1. Get total count of published deals
  ------------------------------------------------------------- */
  const { count, error } = await supabaseAdmin
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("status", "Published");

  if (error) {
    console.error("Deals count error:", error);
  }

  const totalDeals = count || 0;
  const pageSize = 1000; // deals per sitemap-deals page
  const totalPages = Math.ceil(totalDeals / pageSize);

  /* -------------------------------------------------------------
      Build sitemap index
  ------------------------------------------------------------- */
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Deals sitemap pages
  for (let i = 1; i <= totalPages; i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-deals/${i}.xml</loc>
  </sitemap>`;
  }

  // Blog sitemap
  xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
  </sitemap>`;

  // Static sitemap
  xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
  </sitemap>`;

  xml += `\n</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
