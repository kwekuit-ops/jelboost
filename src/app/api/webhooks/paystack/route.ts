import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(bodyText).digest("hex");
    
    if (hash !== signature) {
      console.warn("[PAYSTACK WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);

    if (payload.event === "charge.success") {
      const data = payload.data;
      const reference = data.reference;
      
      // Amount is in cents, convert back to dollars
      const amountPaid = data.amount / 100;

      // Find the pending transaction
      const transaction = await prisma.transaction.findUnique({
        where: { paymentReference: reference }
      });

      if (!transaction) {
        console.error(`[PAYSTACK WEBHOOK] Transaction not found: ${reference}`);
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      if (transaction.status === "COMPLETED") {
        // Already processed
        return NextResponse.json({ status: "success" }, { status: 200 });
      }

      // Atomically update transaction and user balance
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "COMPLETED",
            metadata: data as any,
          }
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: amountPaid } }
        })
      ]);

      console.log(`[PAYSTACK WEBHOOK] Successfully processed deposit: ${reference} for $${amountPaid}`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[PAYSTACK WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
