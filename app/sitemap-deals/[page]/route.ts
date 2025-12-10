export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page } = await context.params;
  const pageNum = parseInt(page, 10);

  const pageSize = 1000;
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;


  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  const { data, error } = await supabaseAdmin
    .from("deals")
    .select("id, slug, slug_es, published_at, created_at")
    .eq("status", "Published")
    .order("id")
    .range(from, to);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const d of data || []) {
    const lastmod = d.published_at || d.created_at || new Date().toISOString();

    xml += `
  <url>
    <loc>${baseUrl}/deals/${d.id}-${d.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;

    if (d.slug_es) {
      xml += `
  <url>
    <loc>${baseUrl}/es/deals/${d.id}-${d.slug_es}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
