import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const depositSchema = z.object({
  amount:        z.coerce.number().positive().min(1, "Minimum deposit is GH₵1"),
  paymentMethod: z.enum(["moolre", "crypto"]),
  currency:      z.string().default("GHS"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = depositSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate a unique reference
    const reference = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create pending transaction with paymentReference so webhook can look it up
    const transaction = await prisma.transaction.create({
      data: {
        userId:           user.id,
        type:             "DEPOSIT",
        status:           "PENDING",
        amount:           parsed.amount,
        currency:         parsed.currency,
        paymentMethod:    parsed.paymentMethod,
        paymentReference: reference,
        description:      `Wallet deposit via ${parsed.paymentMethod === "moolre" ? "Mobile Money (Moolre)" : "Crypto"}`,
      },
    });

    // ── Moolre (Via Jeilinks Bridge) ─────────────────────────────────────────
    if (parsed.paymentMethod === "moolre") {
      const moolreRes = await fetch("https://jeilinks.site/api/bridge/moolre/init", {
        method: "POST",
        headers: {
          "x-bridge-secret": process.env.JELBOOST_BRIDGE_SECRET || "",
          "Content-Type":    "application/json",
        },
        body: JSON.stringify({
          customer_email: user.email,
          customer_name:  user.name || "Customer",
          amount:         parsed.amount,
          reference,
          // Jeilinks bridge will handle callback_url and webhook_url internally
        }),
      });

      const moolreData = await moolreRes.json();

      let paymentUrl: string;

      if (moolreRes.ok && moolreData.status && moolreData.data?.checkout_url) {
        paymentUrl = moolreData.data.checkout_url;
      } else {
        // Log the actual Moolre error for debugging
        console.error("[WALLET DEPOSIT] Moolre error:", moolreData);
        throw new Error(
          moolreData?.message || moolreData?.error || "Moolre checkout initialization failed"
        );
      }

      return NextResponse.json({ paymentUrl, reference, transactionId: transaction.id });
    }

    // ── Crypto ───────────────────────────────────────────────────────────────
    if (parsed.paymentMethod === "crypto") {
      return NextResponse.json({
        method:        "crypto",
        address:       process.env.CRYPTO_WALLET_ADDRESS || "",
        amount:        parsed.amount,
        transactionId: transaction.id,
      });
    }

    return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    }
    console.error("[WALLET DEPOSIT]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
