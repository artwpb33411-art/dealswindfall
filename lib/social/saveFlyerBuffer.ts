import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type StoredFlyer = {
  bucket: string;
  path: string;
  publicUrl: string;
};

export async function saveFlyerBufferToSupabase(
  buffer: Buffer,
  ext: "jpg" | "png" = "jpg"
): Promise<StoredFlyer> {
  const bucket = "social-temp";
  const path = `flyers/${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: ext === "jpg" ? "image/jpeg" : "image/png",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Failed to generate public URL for flyer");
  }

  return {
    bucket,
    path,
    publicUrl: data.publicUrl,
  };
}
