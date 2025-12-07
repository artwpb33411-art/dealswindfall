import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "../types";
import path from "path";

// Square size for X & Telegram
const SIZE = 1080;

// Register fonts
registerFont(path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"), {
  family: "Inter",
});
registerFont(path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"), {
  family: "Inter",
  weight: "700",
});

// Auto line-wrap text
function wrapText(
  ctx: any,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = test;
    }
  }
  if (line.trim() !== "") lines.push(line.trim());
  return lines;
}

// Format price
function formatPrice(val: number | null) {
  if (val == null) return "$0.00";
  return `$${val.toFixed(2)}`;
}

// Main generator
export async function generateFlyerSquare(
  deal: SelectedDeal
): Promise<Buffer> {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Title
  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.font = "700 48px Inter";

  const maxTextWidth = 900;
  const safeTitle =
  deal.title ||
  deal.description ||
  deal.notes ||
  deal.slug ||
  "Hot Deal!";

const titleLines = wrapText(ctx, safeTitle, maxTextWidth);

  let y = 90;
  titleLines.slice(0, 3).forEach((line) => {
    ctx.fillText(line, SIZE / 2, y);
    y += 60;
  });

  // Product Image
  const safeUrl =
    deal.image_link ||
    "https://www.dealswindfall.com/dealswindfall-logoA.png";

  try {
    const img = await loadImage(safeUrl);

    const maxW = 900;
    const maxH = 500;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (SIZE - w) / 2;
    const yImg = 200;

    ctx.drawImage(img, x, yImg, w, h);
  } catch (err) {
    console.error("❌ Square flyer image error:", err);
  }

  // Price Badge
  const badgeW = 700;
  const badgeH = 180;
  const badgeX = (SIZE - badgeW) / 2;
  const badgeY = 770;
  const r = 50;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(badgeX + r, badgeY);
  ctx.lineTo(badgeX + badgeW - r, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r);
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r);
  ctx.quadraticCurveTo(
    badgeX + badgeW,
    badgeY + badgeH,
    badgeX + badgeW - r,
    badgeY + badgeH
  );
  ctx.lineTo(badgeX + r, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r);
  ctx.lineTo(badgeX, badgeY + r);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "700 80px Inter";
  ctx.fillText(formatPrice(deal.price), SIZE / 2, badgeY + 100);

  const percent =
    deal.percent_diff ??
    (deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0);

  ctx.font = "700 40px Inter";
  ctx.fillText(`${percent}% OFF`, SIZE / 2, badgeY + 160);

  // Footer Logo (left)
  try {
    const logo = await loadImage(
      "https://www.dealswindfall.com/dealswindfall-logoA.png"
    );
    const logoH = 80;
    const logoW = (logo.width / logo.height) * logoH;

    ctx.drawImage(logo, 60, SIZE - 120, logoW, logoH);
  } catch (e) {
    console.error("Footer logo error:", e);
  }

  // Footer Website (right)
  ctx.fillStyle = "#b91c1c";
  ctx.textAlign = "right";
  ctx.font = "700 40px Inter";
  ctx.fillText("www.dealswindfall.com", SIZE - 60, SIZE - 70);

  return canvas.toBuffer("image/png");
}
