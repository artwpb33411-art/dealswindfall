import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("auto_publish_platforms")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabaseAdmin
    .from("auto_publish_platforms")
    .update({
      x: body.x,
      telegram: body.telegram,
      facebook: body.facebook,
      instagram: body.instagram,
      reddit: body.reddit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
