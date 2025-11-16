import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("auth", "true", { httpOnly: true, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
