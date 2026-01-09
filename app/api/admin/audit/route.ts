import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { action } = await req.json();

    if (!action) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin audit error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
