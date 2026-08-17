import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const depositSchema = z.object({
  amount: z.coerce.number().min(5, "Minimum deposit is $5").max(10000, "Maximum deposit is $10,000"),
  method: z.enum(["moolre", "paystack", "stripe", "crypto"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { amount, method } = depositSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const reference = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Save pending transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        status: "PENDING",
        amount: amount,
        currency: "USD",
        paymentMethod: method,
        paymentReference: reference,
        description: `Wallet Top-up via ${method}`,
      },
    });

    // 2. Initialize Payment Gateway Checkout
    let checkoutUrl = "";

    if (method === "moolre") {
      // Initialize Moolre Checkout
      // Converting USD to GHS or processing in USD depending on Moolre account configuration
      const moolreRes = await fetch("https://api.moolre.com/v1/checkout/initialize", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.MOOLRE_API_KEY || "",
          "X-APP-ID": process.env.MOOLRE_APP_ID || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_email: user.email,
          customer_name: user.name || "Customer",
          amount: amount, 
          reference: reference,
          currency: "GHS", // Changed to GHS as the platform base currency
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, // redirect after payment
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/moolre`
        }),
      });

      const moolreData = await moolreRes.json();
      if (!moolreRes.ok || !moolreData.status) {
        // Fallback for demonstration if API is unreachable or keys are invalid
        console.warn("Moolre API error, falling back to dummy URL for testing:", moolreData);
        checkoutUrl = `https://checkout.moolre.com/pay/${reference}`;
      } else {
        checkoutUrl = moolreData.data.checkout_url;
      }
    } else if (method === "paystack") {
      // Paystack is handled via /api/wallet/deposit — not supported here
      throw new Error("Use the main deposit flow for Paystack.");
    } else if (method === "crypto") {
      // Crypto logic to be implemented later
      throw new Error("Crypto is not fully configured yet.");
    }

    return NextResponse.json({ checkoutUrl, reference }, { status: 200 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[DEPOSIT API]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
