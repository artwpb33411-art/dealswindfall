import { NextResponse } from "next/server";

export async function GET() {
  const isPreview =
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");

  // 🚫 Preview / Dev: block everything
  if (isPreview) {
    const robots = `
User-agent: *
Disallow: /
    `.trim();

    return new NextResponse(robots, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // ✅ Production: allow public pages
  const robots = `
User-agent: *
Allow: /

# Block admin backend
Disallow: /admin
Disallow: /api/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
  `.trim();

  return new NextResponse(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
