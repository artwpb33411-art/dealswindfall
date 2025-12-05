import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "../types";
import path from "path";

const WIDTH = 1080;
const HEIGHT = 1920;

registerFont(path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"), {
  family: "Inter",
});
registerFont(path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"), {
  family: "Inter",
  weight: "700",
});

function formatPrice(val: number | null) {
  if (val == null) return "$0.00";
  return `$${val.toFixed(2)}`;
}

function wrapLines(ctx: any, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = w + " ";
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line.trim()) {
    lines.push(line.trim());
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
  }
  if (lines.length === maxLines) {
    lines[lines.length - 1] = lines[lines.length - 1] + "...";
  }
  return lines;
}

export async function generateFlyerStory(
  deal: SelectedDeal
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // TITLE
  ctx.fillStyle = "#111827";
  let fontSize = 60;
  let lines: string[] = [];

  while (fontSize >= 34) {
    ctx.font = `700 ${fontSize}px Inter`;
    lines = wrapLines(ctx, deal.title, 900, 2);
    if (lines.length <= 2) break;
    fontSize -= 2;
  }

  ctx.textAlign = "center";
  let y = 150;
  const lineHeight = fontSize + 10;

  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += lineHeight;
  }

  // IMAGE
  const safeUrl =
    deal.image_link ||
    "https://www.dealswindfall.com/dealswindfall-logoA.png";

  let imgBottom = y + 40;

  try {
    const img = await loadImage(safeUrl);

    const maxW = 900;
    const maxH = 800;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (WIDTH - w) / 2;
    const imgY = y + 40;

    ctx.drawImage(img, x, imgY, w, h);
    imgBottom = imgY + h;
  } catch (e) {
    console.error("Story image load fail:", e);
    imgBottom = y + 300;
  }

  // PRICE BADGE (above footer)
  const badgeH = 220;
  const footerTop = HEIGHT - 220;
  let badgeY = imgBottom + 90;
  const maxBadgeY = footerTop - badgeH - 40;
  if (badgeY > maxBadgeY) badgeY = maxBadgeY;

  const badgeW = 820;
  const badgeX = (WIDTH - badgeW) / 2;
  const r = 60;

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

  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff ??
    (deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 90px Inter";
  ctx.fillText(price, WIDTH / 2, badgeY + 125);

  ctx.font = "700 50px Inter";
  ctx.fillText(`${percent}% OFF`, WIDTH / 2, badgeY + 195);

  // FOOTER (logo left, URL right)
  const logoY = HEIGHT - 170;

  try {
    const logo = await loadImage(
      "https://www.dealswindfall.com/dealswindfall-logoA.png"
    );
    const logoH = 80;
    const logoW = (logo.width / logo.height) * logoH;

    ctx.drawImage(logo, 80, logoY, logoW, logoH);
  } catch (e) {
    console.error("Story footer logo error:", e);
  }

  ctx.textAlign = "right";
  ctx.font = "400 38px Inter";
  ctx.fillStyle = "#b91c1c";
  ctx.fillText("www.dealswindfall.com", WIDTH - 80, HEIGHT - 70);

  return canvas.toBuffer("image/png");
}
