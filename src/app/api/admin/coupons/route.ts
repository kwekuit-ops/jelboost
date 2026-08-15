import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  code:          z.string().min(3),
  description:   z.string().optional(),
  discountType:  z.enum(["percentage","fixed"]),
  discountValue: z.coerce.number().positive(),
  maxUses:       z.coerce.number().int().optional(),
  expiresAt:     z.string().optional(),
  isActive:      z.boolean().default(true),
});

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session && ["ADMIN","SUPER_ADMIN"].includes((session.user as any)?.role);
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        code:          parsed.code.toUpperCase(),
        description:   parsed.description,
        discountType:  parsed.discountType,
        discountValue: parsed.discountValue,
        maxUses:       parsed.maxUses,
        expiresAt:     parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
        isActive:      parsed.isActive,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    if (err.code === "P2002") return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
