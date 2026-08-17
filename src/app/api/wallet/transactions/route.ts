import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all | deposits | payments

    const whereClause: any = { userId: session.user.id };
    if (filter === "deposits") whereClause.type = "DEPOSIT";
    if (filter === "payments") whereClause.type = "ORDER_PAYMENT";

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("[WALLET TRANSACTIONS]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
