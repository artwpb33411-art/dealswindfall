import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
 const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");

  const now = new Date().toISOString();

  const staticPages = [
    { path: "", priority: "1.0" },          // Home
    { path: "/categories", priority: "0.8" },
    { path: "/blog", priority: "0.7" },
    { path: "/about", priority: "0.5" },
    { path: "/contact", priority: "0.5" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const p of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
