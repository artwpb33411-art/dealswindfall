import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) throw new Error("Missing URL");

    const hostname = new URL(url).hostname;
    const apiKey = process.env.SCRAPER_API_KEY;
    let html = "";

    // 1️⃣ Try normal fetch first
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/125 Safari/537.36",
        },
      });
      html = await res.text();
    } catch (err) {
      console.warn("Normal fetch failed, switching to ScraperAPI...");
    }

    // 2️⃣ Fallback via ScraperAPI (handles JS + Cloudflare)
    if ((!html || html.length < 5000) && apiKey) {
      const apiUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(
        url
      )}&render=true`;
      const res2 = await fetch(apiUrl);
      html = await res2.text();
    }

    if (!html) throw new Error("Unable to fetch page content.");

    const $ = cheerio.load(html);
    let title = "",
      price = "",
      oldPrice = "",
      image = "",
      store = "",
      coupon = "",
      category = "";

    /* ---------- Amazon ---------- */
    if (hostname.includes("amazon")) {
      title =
        $("#productTitle").text().trim() ||
        $('meta[name="title"]').attr("content") ||
        $("h1").first().text().trim();
      price =
        $(".a-price .a-offscreen").first().text().trim() ||
        $("#priceblock_ourprice").text().trim() ||
        $("#priceblock_dealprice").text().trim();
      oldPrice = $(".a-text-price .a-offscreen").first().text().trim();
      image =
        $("#landingImage").attr("src") ||
        $('meta[property="og:image"]').attr("content");
      store = "Amazon";
    }

    /* ---------- Walmart ---------- */
    else if (hostname.includes("walmart")) {
      title =
        $("h1").first().text().trim() ||
        $('meta[property="og:title"]').attr("content");
      price =
        $('[itemprop="price"]').attr("content") ||
        $('[data-automation-id="product-price"]').text().trim();
      oldPrice = $('[data-automation-id="was-price"]').text().trim();
      image =
        $('meta[property="og:image"]').attr("content") ||
        $("img").first().attr("src");
      store = "Walmart";
    }

    /* ---------- Target ---------- */
    else if (hostname.includes("target")) {
      title =
        $('meta[property="og:title"]').attr("content") ||
        $("h1").text().trim();
      price =
        $('[data-test="product-price"]').text().trim() ||
        $('[itemprop="price"]').attr("content");
      oldPrice = $('[data-test="product-price-previous"]').text().trim();
      image =
        $('meta[property="og:image"]').attr("content") ||
        $("img").first().attr("src");
      store = "Target";
    }

    /* ---------- Best Buy ---------- */
    else if (hostname.includes("bestbuy")) {
      title =
        $(".sku-title h1").text().trim() ||
        $('meta[property="og:title"]').attr("content");
      price =
        $(".priceView-customer-price span").first().text().trim() ||
        $('[itemprop="price"]').attr("content");
      oldPrice = $(".priceView-hero-price span.line-through").text().trim();
      image =
        $('meta[property="og:image"]').attr("content") ||
        $(".primary-image").attr("src");
      store = "Best Buy";
    }

    /* ---------- Costco ---------- */
    else if (hostname.includes("costco")) {
      title =
        $('meta[property="og:title"]').attr("content") ||
        $("h1").text().trim();
      price =
        $('[itemprop="price"]').attr("content") ||
        $(".product-price").first().text().trim();
      image =
        $('meta[property="og:image"]').attr("content") ||
        $(".img-responsive").first().attr("src");
      store = "Costco";
    }

    // Category guess
    const t = title.toLowerCase();
    if (t.includes("tv") || t.includes("laptop")) category = "Electronics";
    else if (t.includes("sofa") || t.includes("chair")) category = "Housewares";
    else if (t.includes("shoe") || t.includes("shirt")) category = "Attire";
    else if (t.includes("vitamin") || t.includes("supplement"))
      category = "Health";
    else if (t.includes("dog") || t.includes("cat")) category = "Pets";
    else if (t.includes("makeup") || t.includes("soap")) category = "Beauty Care";

    // Discount %
    let percentDiff = null;
    try {
      const o = parseFloat(oldPrice.replace(/[^0-9.]/g, ""));
      const c = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (o && c && o > c) percentDiff = Number(((o - c) / o * 100).toFixed(2));
    } catch {}

    return NextResponse.json({
      title,
      price,
      oldPrice,
      percentDiff,
      coupon,
      image,
      store,
      category,
    });
  } catch (e: any) {
    console.error("❌ Scrape error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
