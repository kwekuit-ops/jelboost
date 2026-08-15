/**
 * BoostLegit Provider API Client
 * Handles all communication with https://boostlegit.com/api/v2
 */

const API_URL = process.env.BOOSTLEGIT_API_KEY
  ? process.env.BOOSTLEGIT_API_URL || "https://boostlegit.com/api/v2"
  : "";
const API_KEY = process.env.BOOSTLEGIT_API_KEY || "";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProviderService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;       // cost per 1000 in USD
  min: string;
  max: string;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
}

export interface ProviderOrderResult {
  order: number;     // provider order ID
}

export interface ProviderOrderStatus {
  charge: string;
  start_count: string;
  status: string;    // Pending | In progress | Completed | Partial | Cancelled
  remains: string;
  currency: string;
}

export interface ProviderBalance {
  balance: string;
  currency: string;
}

// ─── Core Request Helper ──────────────────────────────────────────────────────

async function apiPost(params: Record<string, string | number>): Promise<unknown> {
  if (!API_KEY || API_KEY === "YOUR_FULL_API_KEY_HERE") {
    throw new Error("BoostLegit API key not configured. Add BOOSTLEGIT_API_KEY to .env.local");
  }

  const body = new URLSearchParams({
    key: API_KEY,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BoostLegit HTTP error: ${res.status}`);
  }

  const data = await res.json();

  if (data?.error) {
    throw new Error(`BoostLegit API error: ${data.error}`);
  }

  return data;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * Fetch all available services from BoostLegit
 */
export async function getProviderServices(): Promise<ProviderService[]> {
  const data = await apiPost({ action: "services" });
  return data as ProviderService[];
}

/**
 * Place an order on BoostLegit
 */
export async function placeProviderOrder(params: {
  service: number;   // BoostLegit service ID
  link: string;      // e.g. TikTok profile URL
  quantity: number;
  runs?: number;     // for drip-feed
  interval?: number; // for drip-feed (minutes)
}): Promise<ProviderOrderResult> {
  const data = await apiPost({ action: "add", ...params });
  return data as ProviderOrderResult;
}

/**
 * Get status of a single order
 */
export async function getProviderOrderStatus(
  providerOrderId: number
): Promise<ProviderOrderStatus> {
  const data = await apiPost({ action: "status", order: providerOrderId });
  return data as ProviderOrderStatus;
}

/**
 * Get status of multiple orders at once
 */
export async function getProviderOrdersStatus(
  providerOrderIds: number[]
): Promise<Record<string, ProviderOrderStatus>> {
  const data = await apiPost({
    action: "multipleStatus",
    orders: providerOrderIds.join(","),
  });
  return data as Record<string, ProviderOrderStatus>;
}

/**
 * Request a refill for a completed order
 */
export async function requestProviderRefill(
  providerOrderId: number
): Promise<{ refill: number }> {
  const data = await apiPost({ action: "refill", order: providerOrderId });
  return data as { refill: number };
}

/**
 * Cancel an order (if supported)
 */
export async function cancelProviderOrder(
  providerOrderId: number
): Promise<{ cancel: number[] }> {
  const data = await apiPost({ action: "cancel", orders: providerOrderId });
  return data as { cancel: number[] };
}

/**
 * Check BoostLegit account balance
 */
export async function getProviderBalance(): Promise<ProviderBalance> {
  const data = await apiPost({ action: "balance" });
  return data as ProviderBalance;
}
