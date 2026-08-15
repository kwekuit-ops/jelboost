import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json();
    const { data } = body;

    if (!data || data.status !== "successful") return NextResponse.json({ ok: true });

    const transactionRef = data.tx_ref;
    const transaction    = await prisma.transaction.findUnique({ where: { paymentReference: transactionRef } });

    if (!transaction || transaction.status === "COMPLETED") return NextResponse.json({ ok: true });

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data:  { status: "COMPLETED" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data:  { balance: { increment: transaction.amount } },
      }),
      prisma.notification.create({
        data: {
          userId:  transaction.userId,
          title:   "Deposit Successful",
          message: `Your wallet has been credited with $${transaction.amount.toFixed(2)} via Flutterwave`,
          type:    "payment",
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[FLW WEBHOOK]", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
