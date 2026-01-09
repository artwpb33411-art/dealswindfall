import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export type AdminRole =
  | "owner"
  | "super_admin"
  | "admin"
  | "content_admin"
  | "analytics_admin";


export type AdminUser = {
  id: string;
  role: AdminRole;
  is_active: boolean;
};

export async function requireAdmin(): Promise<AdminUser> {
  // 🔑 Next.js 16: cookies() is ASYNC
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!admin) {
    throw new Error("NOT_AUTHORIZED");
  }

  return admin as AdminUser;
}
