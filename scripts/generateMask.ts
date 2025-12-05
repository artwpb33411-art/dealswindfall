import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

const WIDTH = 1024;
const HEIGHT = 1792;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

// Fill entire canvas white
ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Create transparent square (centered upper area)
const boxSize = 800;
const boxX = (WIDTH - boxSize) / 2;
const boxY = 300;

ctx.clearRect(boxX, boxY, boxSize, boxSize);

// Save to public
const outputPath = path.join(process.cwd(), "public/ai-masks/flyer-mask.png");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

console.log("Mask generated:", outputPath);
