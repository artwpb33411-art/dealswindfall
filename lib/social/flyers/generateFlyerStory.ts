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
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = w + " ";
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }

  if (line.trim() && lines.length < maxLines) lines.push(line.trim());
  if (lines.length > maxLines) lines.length = maxLines;

  return lines;
}

export async function generateFlyerStory(
  deal: SelectedDeal
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // SAFE TITLE
  const safeTitle =
    deal.title ||
    deal.description ||
    deal.slug ||
    "Hot Deal!";

  ctx.fillStyle = "#111827";

  let fontSize = 60;
  let titleLines: string[] = [];

  while (fontSize >= 34) {
    ctx.font = `700 ${fontSize}px Inter`;
    titleLines = wrapLines(ctx, safeTitle, 900, 2);
    if (titleLines.length <= 2) break;
    fontSize -= 2;
  }

  ctx.textAlign = "center";
  let y = 150;

  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += fontSize + 10;
  }

  // IMAGE
  const safeUrl =
    deal.image_link || "https://www.dealswindfall.com/dealswindfall-logoA.png";

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
  } catch {
    imgBottom = y + 300;
  }

  // PRICE BADGE
  const badgeH = 220;
  const badgeW = 820;
  const badgeX = (WIDTH - badgeW) / 2;

  const footerTop = HEIGHT - 220;

  let badgeY = imgBottom + 90;
  if (badgeY > footerTop - badgeH - 40) badgeY = footerTop - badgeH - 40;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60);
  ctx.fill();

  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff != null
      ? deal.percent_diff
      : deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0;

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = "700 90px Inter";
  ctx.fillText(price, WIDTH / 2, badgeY + 125);

  ctx.font = "700 50px Inter";
  ctx.fillText(`${percent}% OFF`, WIDTH / 2, badgeY + 195);

  // FOOTER LOGO
  const logoY = HEIGHT - 170;

  try {
    const logo = await loadImage("https://www.dealswindfall.com/dealswindfall-logoA.png");
    const logoH = 80;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, 80, logoY, logoW, logoH);
  } catch {}

  ctx.textAlign = "right";
  ctx.font = "400 38px Inter";
  ctx.fillStyle = "#b91c1c";
  ctx.fillText("www.dealswindfall.com", WIDTH - 80, HEIGHT - 70);

  return canvas.toBuffer("image/png");
}
