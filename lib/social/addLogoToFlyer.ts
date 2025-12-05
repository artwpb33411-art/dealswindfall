import { createCanvas, loadImage } from "canvas";

export async function addLogoToFlyer(base64: string) {
  const flyer = await loadImage(`data:image/png;base64,${base64}`);
  const logo = await loadImage("https://www.dealswindfall.com/dealswindfall-logoA.png");

  const WIDTH = flyer.width;
  const HEIGHT = flyer.height;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Draw AI flyer
  ctx.drawImage(flyer, 0, 0);

  // Add logo at bottom center
  const logoH = 150;
  const logoW = (logo.width / logo.height) * logoH;

  ctx.drawImage(logo, (WIDTH - logoW) / 2, HEIGHT - logoH - 40, logoW, logoH);

  // Return new base64
  return canvas.toBuffer("image/png").toString("base64");
}
