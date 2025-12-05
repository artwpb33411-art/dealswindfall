import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // same as your bulk deals route

export async function POST(req: Request) {
  try {
    // TODO: add your admin auth check here (if you have one)
    const body = await req.json();

    const {
      id,
      slug,
      title_en,
      title_es,
      content_en,
      content_es,
      meta_title_en,
      meta_title_es,
      meta_description_en,
      meta_description_es,
      cover_image_url,
      tags,
      published,
    } = body;

    if (!slug || !title_en || !content_en) {
      return NextResponse.json(
        { error: "slug, title_en and content_en are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (id) {
      // UPDATE existing
      const { error } = await supabaseAdmin
        .from("blog_posts")
        .update({
          slug,
          title_en,
          title_es,
          content_en,
          content_es,
          meta_title_en,
          meta_title_es,
          meta_description_en,
          meta_description_es,
          cover_image_url,
          tags,
          published,
          updated_at: now,
          published_at: published ? now : null,
        })
        .eq("id", id);

      if (error) throw error;
      return NextResponse.json({ success: true, id });
    } else {
      // INSERT new
      const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .insert({
          slug,
          title_en,
          title_es,
          content_en,
          content_es,
          meta_title_en,
          meta_title_es,
          meta_description_en,
          meta_description_es,
          cover_image_url,
          tags,
          published,
          created_at: now,
          updated_at: now,
          published_at: published ? now : null,
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, id: data.id });
    }
  } catch (err) {
    console.error("Admin blog save error:", err);
    return NextResponse.json(
      { error: "Failed to save blog post" },
      { status: 500 }
    );
  }
}
