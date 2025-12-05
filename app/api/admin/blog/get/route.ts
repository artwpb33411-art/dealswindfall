import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ post: data });
  } catch (err: any) {
    console.error("Get blog error:", err);
    return NextResponse.json(
      { error: "Failed to load blog post" },
      { status: 500 }
    );
  }
}
