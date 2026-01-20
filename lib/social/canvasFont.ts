import type { CanvasRenderingContext2D } from "canvas";

export function setFont(
  ctx: CanvasRenderingContext2D,
  size: number,
  weight: 400 | 700 = 400
) {
  const family = weight === 700 ? "Inter-Bold" : "Inter-Regular";
  ctx.font = `${size}px "${family}"`;
}
