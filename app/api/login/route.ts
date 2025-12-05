import { NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

// ------------------ RATE LIMITER ------------------
const rateLimiter = new RateLimiterMemory({
  points: 5,           // 5 login attempts
  duration: 60,        // per 60 seconds from same IP
});

// ------------------ HCAPTCHA VERIFY ------------------
async function verifyHCaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET;

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${secret}`,
  });

  const data = await response.json();
  return data.success === true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // ------------------ RATE LIMIT CHECK ------------------
  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 1 minute." },
      { status: 429 }
    );
  }

  // ------------------ READ REQUEST BODY ------------------
  const { username, password, hcaptchaToken } = await request.json();

  // ------------------ VALIDATE CAPTCHA ------------------
  const isValidCaptcha = await verifyHCaptcha(hcaptchaToken);
  if (!isValidCaptcha) {
    return NextResponse.json(
      { error: "Captcha verification failed" },
      { status: 400 }
    );
  }

  // ------------------ CHECK USERNAME/PASSWORD ------------------
  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ success: true });

    res.cookies.set("auth", "true", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: true,
    });

    return res;
  }

  return NextResponse.json(
    { error: "Invalid username or password" },
    { status: 401 }
  );
}
