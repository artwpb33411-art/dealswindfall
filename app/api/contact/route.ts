import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
	  

    const body = await req.json();
    const { captchaToken, ...form } = body;

    // 1. Verify hCaptcha
    const verify = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET}`,
    });

    const result = await verify.json();
    if (!result.success) {
      return NextResponse.json({ error: "Captcha verification failed." });
    }

    // 2. Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form Submission — ${form.reason}`,
      text: JSON.stringify(form, null, 2),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
