import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "./types";
import path from "path";

const WIDTH = 1080;
const HEIGHT = 1350;

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

  if (line.trim()) lines.push(line.trim());
  if (lines.length > maxLines) lines.length = maxLines;

  return lines;
}

export async function generateFlyer(deal: SelectedDeal): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // TITLE
  const safeTitle =
    deal.title ||
    deal.description ||
    deal.slug ||
    "Hot Deal!";

  ctx.fillStyle = "#111827";

  let fontSize = 56;
  let lines: string[] = [];

  while (fontSize >= 34) {
    ctx.font = `700 ${fontSize}px Inter`;
    lines = wrapLines(ctx, safeTitle, 900, 2);
    if (lines.length <= 2) break;
    fontSize -= 2;
  }

  ctx.textAlign = "center";
  let y = 130;

  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += fontSize + 10;
  }

  // IMAGE
  const safeUrl =
    deal.image_link || "https://www.dealswindfall.com/dealswindfall-logoA.png";

  let imageBottom = y + 40;

  try {
    const img = await loadImage(safeUrl);

    const maxW = 900;
    const maxH = 550;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (WIDTH - w) / 2;
    const imgY = y + 40;

    ctx.drawImage(img, x, imgY, w, h);
    imageBottom = imgY + h;
  } catch {
    imageBottom = y + 300;
  }

  // PRICE BADGE
  const badgeH = 190;
  const footerTop = HEIGHT - 260;
  const badgeW = 650;
  const badgeX = (WIDTH - badgeW) / 2;
  let badgeY = imageBottom + 80;

  if (badgeY > footerTop - badgeH) badgeY = footerTop - badgeH;

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

  ctx.font = "700 80px Inter";
  ctx.fillText(price, WIDTH / 2, badgeY + 105);

  ctx.font = "700 42px Inter";
  ctx.fillText(`${percent}% OFF`, WIDTH / 2, badgeY + 160);

  // FOOTER
  const footerY = HEIGHT - 150;

  try {
    const logo = await loadImage("https://www.dealswindfall.com/dealswindfall-logoA.png");
    const logoH = 90;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, 80, footerY, logoW, logoH);
  } catch {}

  ctx.textAlign = "right";
  ctx.fillStyle = "#b91c1c";
  ctx.font = "400 40px Inter";
  ctx.fillText("www.dealswindfall.com", WIDTH - 80, footerY + 65);

 return canvas.toBuffer("image/jpeg", { quality: 0.9 });

}
