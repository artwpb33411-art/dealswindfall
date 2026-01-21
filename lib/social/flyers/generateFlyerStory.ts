
import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "../types";
import path from "path";
import { loadFonts } from "../fonts";
import { setFont } from "../canvasFont";
import type { CanvasRenderingContext2D } from "canvas";
import type { FlyerLang } from "../flyerText";
import { FLYER_TEXT } from "../flyerText";
import { resolveFlyerTitle } from "../utils/resolveFlyerTitle";
import { normalizeFlyerTitle } from "../utils/normalizeFlyerTitle";



loadFonts();
console.log("✅ Inter fonts loaded");

const WIDTH = 1080;
const HEIGHT = 1920;
/*
registerFont(path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"), {
  family: "Inter",
});
registerFont(path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"), {
  family: "Inter",
  weight: "700",
});
*/


function formatPrice(val: number | null) {
  if (val == null) return "$0.00";
  return `$${val.toFixed(2)}`;
}


//import { setFont } from "../canvasFont";

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  fontSize: number,
  weight: 400 | 700 = 700
) {
  // 🔑 ALWAYS set font before measuring
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

export async function generateFlyerStory(
  deal: SelectedDeal,
  imageBuffer: Buffer,
  lang: FlyerLang = "en"
): Promise<Buffer> {


  // 🔒 HARD GUARD — MUST BE FIRST
  if (typeof deal.price !== "number") {
    throw new Error(
      `❌ RAW DEAL PASSED TO generateFlyerStory.
Keys: ${Object.keys(deal).join(", ")}`
    );
  }
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const t = FLYER_TEXT[lang];

  /* ---------- TITLE ---------- */
 const rawTitle = resolveFlyerTitle(
  deal,
  lang,
  t.fallbackTitle
);

const safeTitle = normalizeFlyerTitle(rawTitle);


  ctx.fillStyle = "#111827";

  let fontSize = 60;
let titleLines: string[] = [];

while (fontSize >= 34) {
  titleLines = wrapLines(ctx, safeTitle, 900, 2, fontSize, 700);
  if (titleLines.length <= 2) break;
  fontSize -= 2;
}


  ctx.textAlign = "center";
  let y = 150;

  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += fontSize + 10;
  }
console.log(
  "FLYER STORY DEAL AAKEYS:",
  Object.keys(deal)
);

  /* ---------- IMAGE ---------- */
  let imgBottom = y + 40;

  try {
    const img = await loadImage(imageBuffer);

    const maxW = 900;
    const maxH = 800;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (WIDTH - w) / 2;
    const imgY = y + 160;

    ctx.drawImage(img, x, imgY, w, h);
    imgBottom = imgY + h;
  } catch (err) {
    console.warn("⚠️ Story flyer image render failed:", err);
  }


  /* ---------- PRICE BADGE ---------- */
  const badgeH = 220;
  const badgeW = 820;
  const badgeX = (WIDTH - badgeW) / 2;

  const footerTop = HEIGHT - 220;
  let badgeY = imgBottom + 90;
  if (badgeY > footerTop - badgeH - 40) {
    badgeY = footerTop - badgeH - 40;
  }

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60);
  ctx.fill();
console.log("PRICE DEBUG:", deal.price, typeof deal.price);
  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff != null
      ? deal.percent_diff
      : deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0;

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

 // ctx.font = "700 90px Inter";
 setFont(ctx, 90, 700);

  ctx.fillText(price, WIDTH / 2, badgeY + 125);

 // ctx.font = "700 50px Inter";
 setFont(ctx, 50, 700);

  ctx.fillText(`${percent}% ${t.off}`, WIDTH / 2, badgeY + 195);

 /* ---------- FOOTER BANNER (FIXED HEIGHT) ---------- */
// FOOTER (STORY – LEFT ALIGNED)
const footerY = HEIGHT - 170;

try {
  const bannerPath = path.join(
    process.cwd(),
    "lib/social/assets/banner.png"
  );

  const banner = await loadImage(bannerPath);

  // 🔒 Story footer rules
  const FOOTER_HEIGHT = 80;
  const LEFT_PADDING = 80;

  // Scale by HEIGHT only
  const scale = FOOTER_HEIGHT / banner.height;
  const bannerH = FOOTER_HEIGHT;
  const bannerW = banner.width * scale;

  ctx.drawImage(banner, LEFT_PADDING, footerY, bannerW, bannerH);
} catch (err) {
  console.warn("⚠️ Story footer banner error:", err);
}
console.log("🟡 Flyer language:", lang);
// Footer text (RIGHT)
ctx.textAlign = "right";
//ctx.font = "400 36px Inter";
setFont(ctx, 46, 400);

ctx.fillStyle = "#b91c1c";
ctx.fillText(t.website, WIDTH - 80, footerY + 58);


  return canvas.toBuffer("image/jpeg", { quality: 0.9 });
}
