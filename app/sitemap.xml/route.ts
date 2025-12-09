export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` ||
    "http://localhost:3000";

  /* -------------------------------------------------------------
      1. Fetch Deals
  ------------------------------------------------------------- */
  const { data: deals, error: dealsError } = await supabaseAdmin
    .from("deals")
    .select("id, slug, slug_es, published_at, created_at, status")
    .eq("status", "Published")
	.range(0, 99999); 

  if (dealsError) {
    console.error("Deals sitemap fetch error:", dealsError);
  }

  /* -------------------------------------------------------------
      2. Fetch Blog Posts
  ------------------------------------------------------------- */
  const { data: blogs, error: blogsError } = await supabaseAdmin
    .from("blog_posts")
    .select("id, slug, published, published_at, updated_at")
	.range(0, 99999); 

  if (blogsError) {
    console.error("Blog sitemap fetch error:", blogsError);
  }

  /* -------------------------------------------------------------
      3. Static Pages
  ------------------------------------------------------------- */
  const staticPages = ["", "/about", "/contact", "/categories", "/blog"];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  /* -------------------------------------------------------------
      Static Pages
  ------------------------------------------------------------- */
  for (const p of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${p}</loc>
    <priority>1.0</priority>
  </url>`;
  }

  /* -------------------------------------------------------------
      Deals (EN + ES)
  ------------------------------------------------------------- */
  if (deals) {
    for (const d of deals) {
      if (!d.slug) continue;

      const lastmod =
        d.published_at || d.created_at || new Date().toISOString();

      // English URL
      xml += `
  <url>
    <loc>${baseUrl}/deals/${d.id}-${d.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.80</priority>
  </url>`;

      // Spanish URL
      if (d.slug_es) {
        xml += `
  <url>
    <loc>${baseUrl}/es/deals/${d.id}-${d.slug_es}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.70</priority>
  </url>`;
      }
    }
  }

  /* -------------------------------------------------------------
      Blog Posts (EN only)
  ------------------------------------------------------------- */
  if (blogs) {
    for (const b of blogs) {
      if (!b.published || !b.slug) continue;

      const lastmod =
        b.published_at || b.updated_at || new Date().toISOString();

      xml += `
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.75</priority>
  </url>`;
    }
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
