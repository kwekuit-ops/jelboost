import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  subject: z.string().min(4),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    // In production: send email via SMTP or a service like Resend/SendGrid
    console.log("[CONTACT FORM]", parsed);

    // Basic rate limiting could be added here with Redis/Upstash
    return NextResponse.json({ message: "Message received. We'll get back to you within 24 hours." }, { status: 200 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
