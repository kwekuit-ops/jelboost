import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Paystack webhook
export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const hash      = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference, amount, status } = event.data;
    if (status !== "success") return NextResponse.json({ ok: true });

    const transaction = await prisma.transaction.findUnique({ where: { paymentReference: reference } });
    if (!transaction || transaction.status === "COMPLETED") return NextResponse.json({ ok: true });

    const amountUSD = amount / 100; // kobo to naira; adjust for GHS if needed

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data:  { status: "COMPLETED", paymentReference: reference },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data:  { balance: { increment: transaction.amount } },
      }),
      prisma.notification.create({
        data: {
          userId:  transaction.userId,
          title:   "Deposit Successful",
          message: `Your wallet has been credited with $${transaction.amount.toFixed(2)}`,
          type:    "payment",
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
