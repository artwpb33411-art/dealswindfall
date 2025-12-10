export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  // 1️⃣ Get total count of deals
  const { count, error } = await supabaseAdmin
    .from("deals")
<<<<<<< Updated upstream
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
=======
    .select("*", { count: "exact", head: true })
    .eq("status", "Published");

  const totalDeals = count || 0;
  const pageSize = 1000;
  const totalPages = Math.ceil(totalDeals / pageSize);
>>>>>>> Stashed changes

  // Build the XML index
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Deal sitemap pages
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
