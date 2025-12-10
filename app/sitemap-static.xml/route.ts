import { NextResponse } from "next/server";

export const runtime = "nodejs";


export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/categories",
    "/blog",
  ];


  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const p of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${p}</loc>
    <priority>1.0</priority>
  </url>`;
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
