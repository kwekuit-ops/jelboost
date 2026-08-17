import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const payload  = JSON.parse(bodyText);

    // ── Signature verification (Bridge Secret) ───────────────
    // The payload is now coming from Jeilinks bridge, not Moolre directly
    const signature = req.headers.get("x-bridge-secret");
    if (process.env.JELBOOST_BRIDGE_SECRET && signature !== process.env.JELBOOST_BRIDGE_SECRET) {
      console.warn("[MOOLRE WEBHOOK] Invalid bridge secret — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ── Handle successful payment ─────────────────────────────────────────────
    const status    = payload.status ?? payload.data?.status ?? "";
    const isSuccess = status === "successful" || status === "success" || status === "SUCCESSFUL";

    if (!isSuccess) {
      // Not a success event — acknowledge and ignore
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const reference  = payload.reference || payload.data?.reference;
    const amountPaid = Number(payload.amount || payload.data?.amount || 0);

    if (!reference) {
      console.error("[MOOLRE WEBHOOK] Missing reference in payload:", payload);
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Find the pending transaction by paymentReference
    const transaction = await prisma.transaction.findUnique({
      where: { paymentReference: reference },
    });

    if (!transaction) {
      console.error(`[MOOLRE WEBHOOK] Transaction not found for reference: ${reference}`);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Idempotency guard — don't double-credit
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // Credit the amount that was actually paid (fall back to the original amount)
    const creditAmount = amountPaid > 0 ? amountPaid : transaction.amount;

    // Atomically complete the transaction + credit user balance + create notification
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status:   "COMPLETED",
          metadata: payload as any,
        },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data:  { balance: { increment: creditAmount } },
      }),
      prisma.notification.create({
        data: {
          userId:  transaction.userId,
          title:   "Deposit Successful 🎉",
          message: `Your wallet has been credited with GH₵${creditAmount.toFixed(2)} via Mobile Money`,
          type:    "payment",
        },
      }),
    ]);

    console.log(`[MOOLRE WEBHOOK] Credited GH₵${creditAmount} for reference: ${reference}`);
    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error) {
    console.error("[MOOLRE WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
