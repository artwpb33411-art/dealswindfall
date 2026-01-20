import { createCanvas, loadImage } from "canvas";
import type { SelectedDeal } from "../types";
import type { CanvasRenderingContext2D } from "canvas";
import path from "path";
import { loadFonts } from "../fonts";
import { setFont } from "../canvasFont";
import type { FlyerLang } from "../flyerText";
import { FLYER_TEXT } from "../flyerText";

loadFonts();

const SIZE = 1080;

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

export async function generateFlyerSquare(
  deal: SelectedDeal,
  imageBuffer: Buffer,
  lang: FlyerLang = "en"
): Promise<Buffer> {

  // 🔒 HARD GUARD — normalized deal only
  if (typeof deal.price !== "number") {
    throw new Error(
      `❌ RAW DEAL PASSED TO generateFlyerSquare.
Keys: ${Object.keys(deal).join(", ")}`
    );
  }

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

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

  const titleLines = wrapLines(ctx, safeTitle, 900, 3, 48, 700);
  let y = 90;

  for (const line of titleLines) {
    ctx.fillText(line, SIZE / 2, y);
    y += 60;
  }

  /* ---------- IMAGE ---------- */
  try {
    const img = await loadImage(imageBuffer);

    const maxW = 900;
    const maxH = 500;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (SIZE - w) / 2;
    const imgY = 200;

    ctx.drawImage(img, x, imgY, w, h);
  } catch (err) {
    console.warn("⚠️ Square flyer failed to render image:", err);
  }

  /* ---------- PRICE BADGE ---------- */
  const badgeW = 700;
  const badgeH = 180;
  const badgeX = (SIZE - badgeW) / 2;
  const badgeY = 770;
  const radius = 50;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
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
  ctx.fillText(price, SIZE / 2, badgeY + 100);

  setFont(ctx, 40, 700);
  ctx.fillText(`${percent}% ${t.off}`, SIZE / 2, badgeY + 160);

  /* ---------- FOOTER ---------- */
  const footerY = SIZE - 100;

  try {
    const bannerPath = path.join(
      process.cwd(),
      "lib/social/assets/banner.png"
    );
    const banner = await loadImage(bannerPath);

    const FOOTER_HEIGHT = 80;
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
    console.warn("⚠️ Square footer banner error:", err);
  }

  ctx.textAlign = "right";
  setFont(ctx, 38, 400);
  ctx.fillStyle = "#b91c1c";
  ctx.fillText(t.website, SIZE - 80, footerY + 60);

  return canvas.toBuffer("image/jpeg", { quality: 0.9 });
}
