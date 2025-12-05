import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug, title_en, published, published_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (err: any) {
    console.error("Admin blog list error:", err);
    return NextResponse.json(
      { error: "Failed to load blog posts" },
      { status: 500 }
    );
  }
}
