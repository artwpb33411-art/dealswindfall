// app/blog/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import BlogListClient from "./BlogListClient";
export const dynamic = "force-dynamic";

export const revalidate = 60; // ISR, good for SEO

export default async function BlogPage() {
  const supabase = supabaseServer();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title_en, title_es, meta_description_en, meta_description_es, cover_image_url, published_at"
    )
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error loading blog posts:", error.message);
  }

  return <BlogListClient posts={posts || []} />;
}
