import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function saveFlyerBufferToSupabase(
  buffer: Buffer,
  ext: "jpg" | "png" = "jpg"
) {
  const bucket = "social-temp";
  const path = `flyers/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: ext === "jpg" ? "image/jpeg" : "image/png",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Failed to generate public URL");
  }

  return { bucket, path, publicUrl: data.publicUrl };
}
