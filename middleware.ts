import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Example: ensure auth cookie exists
  // res.cookies.set("admin_checked", "true", {
  //   httpOnly: true,
  //   path: "/admin",
  // });

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
