import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateOrderPrice } from "@/lib/utils";
import { placeProviderOrder } from "@/lib/providers/boostlegit";

const orderSchema = z.object({
  serviceId: z.string().min(1),
  link:      z.string().url(),
  quantity:  z.coerce.number().int().positive(),
  coupon:    z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page   = parseInt(searchParams.get("page") || "1");
  const limit  = parseInt(searchParams.get("limit") || "20");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { service: { select: { name: true, platform: true } } },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = orderSchema.parse(body);

    const service = await prisma.service.findUnique({ where: { id: parsed.serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Service not found or unavailable" }, { status: 404 });
    }

    if (parsed.quantity < service.minQuantity || parsed.quantity > service.maxQuantity) {
      return NextResponse.json({ error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` }, { status: 400 });
    }

    let totalPrice = calculateOrderPrice(service.pricePerThousand, parsed.quantity);
    let couponId: string | undefined;

    // Validate coupon
    if (parsed.coupon) {
      const coupon = await prisma.coupon.findUnique({ where: { code: parsed.coupon, isActive: true } });
      if (coupon) {
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
        }
        const discount = coupon.discountType === "percentage"
          ? totalPrice * (coupon.discountValue / 100)
          : coupon.discountValue;
        totalPrice = Math.max(0, totalPrice - discount);
        couponId = coupon.id;
      }
    }

    // Check balance
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.balance < totalPrice) {
      return NextResponse.json({ error: "Insufficient balance. Please add funds to your wallet." }, { status: 402 });
    }

    // Create order and deduct balance atomically
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId:    session.user.id,
          serviceId: parsed.serviceId,
          link:      parsed.link,
          quantity:  parsed.quantity,
          totalPrice,
          status:    "PENDING",
          couponId,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data:  { balance: { decrement: totalPrice }, totalSpent: { increment: totalPrice } },
      }),
      prisma.transaction.create({
        data: {
          userId:      session.user.id,
          type:        "ORDER_PAYMENT",
          status:      "COMPLETED",
          amount:      totalPrice,
          description: `Order for ${service.name}`,
        },
      }),
    ]);

    if (couponId) {
      await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    // ── Forward order to BoostLegit provider ──────────────────────────────
    if (service.externalServiceId) {
      try {
        const providerResult = await placeProviderOrder({
          service:  Number(service.externalServiceId),
          link:     parsed.link,
          quantity: parsed.quantity,
        });
        // Save provider order ID so we can track/refill/cancel it later
        await prisma.order.update({
          where: { id: order.id },
          data: {
            externalOrderId: String(providerResult.order),
            status: "PROCESSING",
          },
        });
      } catch (providerErr) {
        // Provider call failed — order stays PENDING, admin can retry
        console.error("[BOOSTLEGIT] Failed to forward order:", providerErr);
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    }
    console.error("[ORDERS POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
