import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const pageTitle = $("title").text()?.trim();

    let title = (ogTitle || pageTitle || "").trim();

    const blockedTitles = [
      "Robot or human?",
      "Are you a robot?",
      "Are you a human?",
      "Access Denied",
      "Request blocked",
      "403 Forbidden",
      "Walmart",
    ];

    if (blockedTitles.includes(title)) {
      title = "Similar deals might be available...";
    }

    return NextResponse.json({ title });
  } catch (err) {
    console.error("Scraping failed:", err);
    return NextResponse.json(
      { error: "Unable to scrape the link" },
      { status: 500 }
    );
  }
}
