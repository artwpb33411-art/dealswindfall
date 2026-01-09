// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

 async function handleLogin() {
  setLoading(true);
  setError(null);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setLoading(false);
    setError(error.message);
    return;
  }

  // ✅ LOG LOGIN EVENT (ONCE PER LOGIN)
 // ✅ LOG LOGIN EVENT ONLY ONCE PER SESSION
if (!sessionStorage.getItem("admin_login_logged")) {
  await fetch("/api/admin/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "login",
    }),
  });

  sessionStorage.setItem("admin_login_logged", "true");
}


  setLoading(false);

  // ✅ Redirect after logging
  router.replace("/admin");
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow border">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        

        {error && (
          <div className="text-sm text-red-600 mb-3">{error}</div>
        )}

        <input
          className="w-full border rounded p-2 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded p-2 mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2 font-semibold disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
