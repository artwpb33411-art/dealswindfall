import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function getFlyerBaseImage(
  imageUrl?: string | null
): Promise<Buffer> {
  try {
    if (!imageUrl) {
      throw new Error("No image URL");
    }

    // Optional: support local paths if ever passed
    if (imageUrl.startsWith("/")) {
      return fs.readFileSync(imageUrl);
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DealsWindfallBot/1.0; +https://dealswindfall.com)",
        Accept: "image/*",
      },
    });

    const inputBuffer = Buffer.from(response.data);

    return await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({
        quality: 90,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
      })
      .toBuffer();
  } catch (err) {
    console.warn(
      "⚠️ Using logo fallback for flyer image:",
      err instanceof Error ? err.message : String(err)
    );

    const logoPath = path.join(
      process.cwd(),
      "lib/social/assets/logo.png"
    );

    return fs.readFileSync(logoPath);
  }
}
