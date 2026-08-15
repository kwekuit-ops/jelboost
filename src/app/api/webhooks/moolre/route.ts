import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Moolre will typically send a signature header to verify the webhook
    // For production, you should verify the webhook signature here
    // using process.env.MOOLRE_API_KEY
    
    if (payload.status === "successful" || payload.status === "success") {
      const reference = payload.reference || payload.data?.reference;
      
      // Handle potential payload structure variations depending on Moolre's exact webhook format
      const amountPaid = payload.amount || payload.data?.amount;

      if (!reference) {
        return NextResponse.json({ error: "Missing reference in payload" }, { status: 400 });
      }

      // Find the pending transaction
      const transaction = await prisma.transaction.findUnique({
        where: { paymentReference: reference }
      });

      if (!transaction) {
        console.error(`[MOOLRE WEBHOOK] Transaction not found: ${reference}`);
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
            metadata: payload as any,
          }
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: Number(amountPaid) || transaction.amount } }
        })
      ]);

      console.log(`[MOOLRE WEBHOOK] Successfully processed deposit: ${reference}`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[MOOLRE WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
