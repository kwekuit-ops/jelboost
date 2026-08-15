import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const depositSchema = z.object({
  amount:        z.coerce.number().positive().min(1),
  paymentMethod: z.string().min(1),
  currency:      z.string().default("USD"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = depositSchema.parse(body);

    // Create a pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId:        session.user.id,
        type:          "DEPOSIT",
        status:        "PENDING",
        amount:        parsed.amount,
        currency:      parsed.currency,
        paymentMethod: parsed.paymentMethod,
        description:   `Wallet deposit via ${parsed.paymentMethod}`,
      },
    });

    let paymentUrl: string | null = null;

    // Payment provider routing
    switch (parsed.paymentMethod) {
      case "paystack": {
        // Initialize Paystack transaction
        const res = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email:     session.user.email,
            amount:    Math.round(parsed.amount * 100), // kobo
            reference: transaction.id,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?success=true`,
            metadata:  { transactionId: transaction.id, userId: session.user.id },
          }),
        });
        const data = await res.json();
        if (data.status) paymentUrl = data.data.authorization_url;
        break;
      }
      case "flutterwave": {
        const res = await fetch("https://api.flutterwave.com/v3/payments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tx_ref:       transaction.id,
            amount:       parsed.amount,
            currency:     "GHS",
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?success=true`,
            customer:     { email: session.user.email, name: session.user.name },
            customizations: { title: "Jelboost GH — Wallet Deposit" },
          }),
        });
        const data = await res.json();
        if (data.status === "success") paymentUrl = data.data.link;
        break;
      }
      case "stripe": {
        // Stripe is handled client-side; return client secret placeholder
        break;
      }
      case "crypto": {
        return NextResponse.json({
          method: "crypto",
          address: process.env.CRYPTO_WALLET_ADDRESS,
          amount: parsed.amount,
          transactionId: transaction.id,
        });
      }
      default:
        break;
    }

    return NextResponse.json({ paymentUrl, transactionId: transaction.id });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    }
    console.error("[WALLET DEPOSIT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
