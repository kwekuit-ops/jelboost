import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session && ["ADMIN","SUPER_ADMIN"].includes((session.user as any)?.role);
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    activeOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.transaction.aggregate({ where: { type: "ORDER_PAYMENT", status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.order.count({ where: { status: { in: ["PENDING","PROCESSING"] } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user:    { select: { name: true, email: true } },
        service: { select: { name: true, platform: true } },
      },
    }),
  ]);

  // Revenue last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const revenueByDay = await prisma.transaction.groupBy({
    by: ["createdAt"],
    where: { type: "ORDER_PAYMENT", status: "COMPLETED", createdAt: { gte: sevenDaysAgo } },
    _sum: { amount: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    stats: {
      totalUsers,
      totalOrders,
      totalRevenue:  totalRevenue._sum.amount || 0,
      activeOrders,
    },
    recentOrders,
    revenueByDay,
  });
}
