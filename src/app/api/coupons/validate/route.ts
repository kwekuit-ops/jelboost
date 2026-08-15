import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { code } = schema.parse(await req.json());

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    return NextResponse.json({
      valid:         true,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      description:   coupon.description,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request" }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
