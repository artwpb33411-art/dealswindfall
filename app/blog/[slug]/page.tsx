// app/blog/[slug]/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";


export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const supabase = supabaseServer();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Error loading blog post:", error.message);
  }

  if (!post) return notFound();

  return <BlogPostClient post={post} />;
}
