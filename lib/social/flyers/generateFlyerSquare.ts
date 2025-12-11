import { createCanvas, loadImage, registerFont } from "canvas";
import type { SelectedDeal } from "../types";
import path from "path";

const SIZE = 1080;

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

function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

export async function generateFlyerSquare(deal: SelectedDeal): Promise<Buffer> {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // SAFE TITLE
  const safeTitle =
    deal.title ||
    deal.description ||
    deal.slug ||
    "Hot Deal!";

  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.font = "700 48px Inter";

  const titleLines = wrapText(ctx, safeTitle, 900);
  let y = 90;

  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, SIZE / 2, y);
    y += 60;
  }

  // IMAGE
  const safeUrl =
    deal.image_link || "https://www.dealswindfall.com/dealswindfall-logoA.png";

  try {
    const img = await loadImage(safeUrl);

    const maxW = 900;
    const maxH = 500;
    const ratio = Math.min(maxW / img.width, maxH / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (SIZE - w) / 2;
    const imgY = 200;

    ctx.drawImage(img, x, imgY, w, h);
  } catch (err) {
    console.error("❌ Square flyer image error:", err);
  }

  // PRICE BADGE
  const badgeW = 700;
  const badgeH = 180;
  const badgeX = (SIZE - badgeW) / 2;
  const badgeY = 770;
  const r = 50;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, r);
  ctx.fill();

  const price = formatPrice(deal.price);
  const percent =
    deal.percent_diff != null
      ? deal.percent_diff
      : deal.old_price && deal.price
      ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
      : 0;

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "700 80px Inter";
  ctx.fillText(price, SIZE / 2, badgeY + 100);

  ctx.font = "700 40px Inter";
  ctx.fillText(`${percent}% OFF`, SIZE / 2, badgeY + 160);

  // FOOTER LOGO
  try {
    const logo = await loadImage("https://www.dealswindfall.com/dealswindfall-logoA.png");
    const logoH = 80;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, 60, SIZE - 120, logoW, logoH);
  } catch (e) {
    console.error("Footer logo error:", e);
  }

  // FOOTER WEBSITE
  ctx.fillStyle = "#b91c1c";
  ctx.textAlign = "right";
  ctx.font = "700 40px Inter";
  ctx.fillText("www.dealswindfall.com", SIZE - 60, SIZE - 70);

  return canvas.toBuffer("image/jpeg", { quality: 0.9 });

}
