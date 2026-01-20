import { createCanvas, loadImage } from "canvas";
import type { SelectedDeal } from "./types";
import path from "path";
import { FLYER_TEXT, FlyerLang } from "./flyerText";
import { loadFonts } from "./fonts";
import { setFont } from "./canvasFont";
import type { CanvasRenderingContext2D } from "canvas";

loadFonts();

const WIDTH = 1080;
const HEIGHT = 1350;

/* ---------- HELPERS ---------- */

function formatPrice(val: number | null) {
  if (val == null) return "$0.00";
  return `$${val.toFixed(2)}`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  fontSize: number,
  weight: 400 | 700 = 700
) {
  setFont(ctx, fontSize, weight);

  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = w + " ";
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }

  if (line.trim() && lines.length < maxLines) {
    lines.push(line.trim());
  }

  return lines;
}

/* ---------- MAIN ---------- */

export async function generateFlyer(
  deal: SelectedDeal,
  imageBuffer: Buffer,
  lang: FlyerLang = "en"
): Promise<Buffer> {

  // 🔒 HARD GUARD
  if (typeof deal.price !== "number") {
    throw new Error(
      `❌ RAW DEAL PASSED TO generateFlyer.
Keys: ${Object.keys(deal).join(", ")}`
    );
  }

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const t = FLYER_TEXT[lang];

  /* ---------- TITLE ---------- */

 const safeTitle: string =
  lang === "es"
    ? deal.description_es?.trim() ||
      deal.title?.trim() ||
      deal.description?.trim() ||
      t.fallbackTitle
    : deal.title?.trim() ||
      deal.description?.trim() ||
      deal.slug ||
      t.fallbackTitle;



  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";

  const titleLines = wrapLines(ctx, safeTitle, 900, 2, 56, 700);

  let y = 130;
  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 66;
  }

  /* ---------- IMAGE ---------- */

  let imageBottom = y + 300; // fallback

  try {
    const img = await loadImage(imageBuffer);

    const maxW = 900;
    const maxH = 520;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (WIDTH - w) / 2;
    const imgY = y + 40;

    ctx.drawImage(img, x, imgY, w, h);
    imageBottom = imgY + h;
  } catch (err) {
    console.warn("⚠️ Portrait flyer image render failed:", err);
  }

  /* ---------- PRICE BADGE ---------- */


  const badgeW = 650;
  const badgeH = 190;
  const badgeX = (WIDTH - badgeW) / 2;
  const footerTop = HEIGHT - 260;

  let badgeY = imageBottom + 80;
  if (badgeY > footerTop - badgeH) {
    badgeY = footerTop - badgeH;
  }

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60);
  ctx.fill();

  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff != null
      ? deal.percent_diff
      : deal.old_price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0;

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  setFont(ctx, 80, 700);
  ctx.fillText(price, WIDTH / 2, badgeY + 105);

  setFont(ctx, 42, 700);
  ctx.fillText(`${percent}% ${t.off}`, WIDTH / 2, badgeY + 160);

  /* ---------- FOOTER ---------- */

  const footerY = HEIGHT - 150;

  try {
    const bannerPath = path.join(
      process.cwd(),
      "lib/social/assets/banner.png"
    );

    const banner = await loadImage(bannerPath);

    const FOOTER_HEIGHT = 90;
    const LEFT_PADDING = 80;
    const scale = FOOTER_HEIGHT / banner.height;

    ctx.drawImage(
      banner,
      LEFT_PADDING,
      footerY,
      banner.width * scale,
      FOOTER_HEIGHT
    );
  } catch (err) {
    console.warn("⚠️ Failed to load footer banner:", err);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#b91c1c";
  setFont(ctx, 40, 400);
  ctx.fillText(t.website, WIDTH - 80, footerY + 65);

  return canvas.toBuffer("image/jpeg", { quality: 0.9 });
}
