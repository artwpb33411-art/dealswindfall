import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function deleteStorageObject(
  bucket: string,
  path: string
) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error("⚠ Failed to delete storage object:", {
      bucket,
      path,
      error,
    });
  }
}
