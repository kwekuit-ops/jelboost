import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:  z.string().min(2).optional(),
  email: z.string().email().optional(),
  preferredCurrency: z.string().optional(),
  preferredLanguage: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications:   z.boolean().optional(),
  pushNotifications:  z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      id:                  true,
      name:                true,
      email:               true,
      image:               true,
      role:                true,
      balance:             true,
      totalSpent:          true,
      referralCode:        true,
      preferredCurrency:   true,
      preferredLanguage:   true,
      emailNotifications:  true,
      smsNotifications:    true,
      pushNotifications:   true,
      createdAt:           true,
      lastLoginAt:         true,
      _count: { select: { orders: true, referrals: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    // Check email uniqueness if changing email
    if (parsed.email && parsed.email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data:  parsed,
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
