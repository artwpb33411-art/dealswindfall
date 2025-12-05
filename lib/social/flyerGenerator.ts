import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "./types";
import path from "path";

// Canvas size
const WIDTH = 1080;
const HEIGHT = 1350;

// Fonts
registerFont(path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"), {
  family: "Inter",
});
registerFont(path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"), {
  family: "Inter",
  weight: "700",
});

// Helpers
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
  if (lines.length === maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1] + "...";
  }
  return lines;
}

export async function generateFlyer(deal: SelectedDeal): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // TITLE
  ctx.fillStyle = "#111827";
  let fontSize = 56;
  let lines: string[] = [];

  while (fontSize >= 34) {
    ctx.font = `700 ${fontSize}px Inter`;
    lines = wrapLines(ctx, deal.title, 900, 2);
    if (lines.length <= 2) break;
    fontSize -= 2;
  }

  ctx.textAlign = "center";
  let y = 130;
  const lineHeight = fontSize + 10;

  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += lineHeight;
  }

  // PRODUCT IMAGE
  const safeImageUrl =
    deal.image_link ||
    "https://www.dealswindfall.com/dealswindfall-logoA.png";

  let imageBottom = y + 40;

  try {
    const image = await loadImage(safeImageUrl);

    const maxW = 900;
    const maxH = 550;
    const ratio = Math.min(maxW / image.width, maxH / image.height);

    const w = image.width * ratio;
    const h = image.height * ratio;

    const imgX = (WIDTH - w) / 2;
    const imgY = y + 40;

    ctx.drawImage(image, imgX, imgY, w, h);
    imageBottom = imgY + h;
  } catch (err) {
    console.error("❌ Flyer image load FAILED:", err);
    imageBottom = y + 300;
  }

  // PRICE BADGE — ensure safe spacing
  const badgeH = 190;
  const footerReservedTop = HEIGHT - 260; // moved down
  let badgeY = imageBottom + 80;
  const maxBadgeY = footerReservedTop - badgeH;

  if (badgeY > maxBadgeY) badgeY = maxBadgeY;

  const badgeW = 650;
  const badgeX = (WIDTH - badgeW) / 2;
  const radius = 60;

  ctx.fillStyle = "#facc15"; // yellow
  ctx.beginPath();
  ctx.moveTo(badgeX + radius, badgeY);
  ctx.lineTo(badgeX + badgeW - radius, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
  ctx.quadraticCurveTo(
    badgeX + badgeW,
    badgeY + badgeH,
    badgeX + badgeW - radius,
    badgeY + badgeH
  );
  ctx.lineTo(badgeX + radius, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
  ctx.lineTo(badgeX, badgeY + radius);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
  ctx.closePath();
  ctx.fill();

  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff ??
    (deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = "700 80px Inter";
  ctx.fillText(price, WIDTH / 2, badgeY + 105);

  ctx.font = "700 42px Inter";
  ctx.fillText(`${percent}% OFF`, WIDTH / 2, badgeY + 160);

  // FOOTER — moved lower so it NEVER overlaps
  const footerY = HEIGHT - 150;

  // Logo left
  try {
    const logo = await loadImage(
      "https://www.dealswindfall.com/dealswindfall-logoA.png"
    );
    const logoH = 90;
    const logoW = (logo.width / logo.height) * logoH;

    ctx.drawImage(logo, 80, footerY, logoW, logoH);
  } catch (err) {
    console.error("Footer logo failed:", err);
  }

  // Website right
  ctx.textAlign = "right";
  ctx.font = "400 40px Inter";
  ctx.fillStyle = "#b91c1c";
  ctx.fillText("www.dealswindfall.com", WIDTH - 80, footerY + 65);

  return canvas.toBuffer("image/png");
}
