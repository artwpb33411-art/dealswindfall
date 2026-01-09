// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) =>
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );

    // 🔐 Must be logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ users: [] }, { status: 401 });
    }

    // 🔐 Must be owner
    const { data: currentAdmin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!currentAdmin || currentAdmin.role !== "owner") {
      return NextResponse.json({ users: [] }, { status: 403 });
    }

    // 📋 Load admins + email
    const { data: admins, error } = await supabase
      .from("admin_users")
      .select(`
        id,
        role,
        is_active,
        created_at,
        auth_users:auth.users(email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN USERS FETCH ERROR:", error);
      return NextResponse.json({ users: [] }, { status: 500 });
    }

    return NextResponse.json({
      users: admins.map((a: any) => ({
        id: a.id,
        email: a.auth_users?.email ?? null,
        role: a.role,
        is_active: a.is_active,
        created_at: a.created_at,
      })),
    });
  } catch (err) {
    console.error("🔥 /api/admin/users GET error:", err);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
