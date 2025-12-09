import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Temporary no-op route to keep Next.js validator happy
export async function GET() {
  return NextResponse.json({ message: "Catalogs API removed" });
}