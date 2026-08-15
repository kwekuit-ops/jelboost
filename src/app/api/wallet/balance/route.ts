import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [user, deposits] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true, totalSpent: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: session.user.id, type: "DEPOSIT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const totalDeposited = deposits._sum.amount ?? 0;
    return NextResponse.json({ ...user, totalDeposited, hasFunded: totalDeposited > 0 });
  } catch (err) {
    console.error("[WALLET BALANCE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
