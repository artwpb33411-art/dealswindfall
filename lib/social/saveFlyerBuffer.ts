import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomUUID } from "crypto";

const FLYER_BUCKET =
  process.env.SUPABASE_FLYER_BUCKET || "social-flyers"; // create this bucket in Supabase

/**
 * Save a flyer Buffer (JPEG) to Supabase Storage and return a public URL.
 */
export async function saveFlyerBufferToSupabase(
  buffer: Buffer,
  ext: "jpg" | "jpeg" = "jpg"
): Promise<string> {
  const id = randomUUID();
  const path = `flyers/${id}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(FLYER_BUCKET)
    .upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase flyer upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage.from(FLYER_BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Could not get public URL for flyer");
  }

  return data.publicUrl;
}
