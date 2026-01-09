// app/api/admin/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST() {
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

    // 1️⃣ Must be logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { admin: null, reason: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    console.log("🧪 AUTH USER ID:", user.id);

    // 2️⃣ Must exist in admin_users
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, role, is_active") // ✅ FIX
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    console.log("✅ ADMIN ME RESPONSE:", admin); // ✅ HERE

    if (!admin) {
      return NextResponse.json(
        { admin: null, reason: "NOT_ADMIN" },
        { status: 403 }
      );
    }

    return NextResponse.json({ admin });
  } catch (err) {
    console.error("🔥 /api/admin/me error:", err);
    return NextResponse.json(
      { admin: null, reason: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
