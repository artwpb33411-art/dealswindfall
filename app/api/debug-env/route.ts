import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 40) + "..."
      : "(not loaded)",

    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 25) + "..."
      : "(not loaded)",

    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "loaded"
      : "(not loaded)",

    SUPABASE_ENVIRONMENT: process.env.VERCEL_ENV || "(unknown)",

    NODE_ENV: process.env.NODE_ENV,
  });
}
