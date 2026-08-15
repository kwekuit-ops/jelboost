/**
 * POST /api/admin/sync-orders
 * Syncs status of all PENDING/PROCESSING orders with BoostLegit.
 * Call this on a cron job every few minutes (e.g. via Vercel Cron or a scheduler).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProviderOrdersStatus } from "@/lib/providers/boostlegit";

import { OrderStatus } from "@prisma/client";

// Map BoostLegit statuses to your internal statuses
const STATUS_MAP: Record<string, OrderStatus> = {
  "Pending":     "PROCESSING",
  "In progress": "PROCESSING",
  "Processing":  "PROCESSING",
  "Completed":   "COMPLETED",
  "Partial":     "PARTIAL",
  "Cancelled":   "CANCELLED",
  "Canceled":    "CANCELLED",
  "Refunded":    "REFUNDED",
};

export async function POST(req: Request) {
  // Simple secret check to protect this endpoint
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all orders that are still in progress
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
        externalOrderId: { not: null },
      },
      take: 100, // process up to 100 at a time
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ message: "No orders to sync", synced: 0 });
    }

    const ids = pendingOrders
      .map((o) => Number(o.externalOrderId))
      .filter((id) => !isNaN(id));

    const statuses = await getProviderOrdersStatus(ids);
    let synced = 0;

    for (const order of pendingOrders) {
      const providerStatus = statuses[order.externalOrderId!];
      if (!providerStatus) continue;

      const newStatus = STATUS_MAP[providerStatus.status] || order.status;

      if (newStatus !== order.status) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status:     newStatus,
            startCount: providerStatus.start_count
              ? parseInt(providerStatus.start_count)
              : undefined,
            remains: providerStatus.remains
              ? parseInt(providerStatus.remains)
              : undefined,
          },
        });
        synced++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: pendingOrders.length,
      synced,
    });
  } catch (err: any) {
    console.error("[SYNC-ORDERS]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
