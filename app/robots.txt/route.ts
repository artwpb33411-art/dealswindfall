import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000";

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
