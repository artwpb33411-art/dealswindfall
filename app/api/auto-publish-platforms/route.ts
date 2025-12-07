import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_platforms")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    x: data.x ?? false,
    telegram: data.telegram ?? false,
    facebook: data.facebook ?? false,
    instagram: data.instagram ?? false,
    reddit: data.reddit ?? false,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabaseAdmin
    .from("auto_publish_platforms")
    .update({
      x: body.x ?? false,
      telegram: body.telegram ?? false,
      facebook: body.facebook ?? false,
      instagram: body.instagram ?? false,
      reddit: body.reddit ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
