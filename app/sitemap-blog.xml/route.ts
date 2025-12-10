export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("published", true);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const b of data || []) {
    const lastmod = b.updated_at || b.published_at;

    xml += `
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
