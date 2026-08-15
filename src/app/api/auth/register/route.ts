import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateReferralCode } from "@/lib/utils";

const schema = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  password:     z.string().min(8),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, referralCode } = schema.parse(body);

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Resolve referral
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      referredById = referrer?.id;
    }

    const hashed = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode(Math.random().toString(36).slice(2, 10));

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        referralCode: newReferralCode,
        referredById,
      },
    });

    // TODO: Send verification email

    return NextResponse.json({ message: "Account created. Please verify your email." }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation error" }, { status: 422 });
    }
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
