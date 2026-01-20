import path from "path";
import { registerFont } from "canvas";

let loaded = false;

export function loadFonts() {
  if (loaded) return;
  loaded = true;

  const base = path.join(process.cwd(), "public", "fonts");

  registerFont(path.join(base, "Inter-Regular.ttf"), {
    family: "Inter-Regular",
  });

  registerFont(path.join(base, "Inter-Bold.ttf"), {
    family: "Inter-Bold",
  });

  console.log("✅ Inter fonts loaded");
}
