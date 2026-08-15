import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Current USD to GHS Exchange Rate (Editable) */
export const USD_TO_GHS_RATE = 16.0;

/** Format a number as GHS currency */
export function formatCurrency(amount: number, currency = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style:    "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a date as a readable string */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  }).format(new Date(date));
}

/** Format date + time */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Calculate order price from price per thousand */
export function calculateOrderPrice(pricePerThousand: number, quantity: number): number {
  return (pricePerThousand / 1000) * quantity;
}

/** Generate a unique referral code */
export function generateReferralCode(seed: string): string {
  return "SB" + seed.toUpperCase().slice(0, 6);
}

/** Truncate a string to a max length */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Format quantity for display (e.g., 1K, 1M) */
export function formatQuantity(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

/** Payment method configurations */
export const PAYMENT_METHODS = [
  { id: "paystack",    name: "Paystack",    icon: "🇬🇭", description: "Ghana Cards, MTN MoMo, Vodafone Cash" },
  { id: "flutterwave", name: "Flutterwave", icon: "💳", description: "MTN, Telecel, AirtelTigo MoMo, Cards" },
  { id: "stripe",      name: "Stripe",      icon: "🌍", description: "International Visa/Mastercard" },
  { id: "paypal",      name: "PayPal",      icon: "🅿️", description: "PayPal balance or linked card" },
  { id: "crypto",      name: "Crypto (USDT TRC20)", icon: "₮", description: "Tether on the Tron network" },
];

/** Platform display names */
export const PLATFORM_LABELS: Record<string, string> = {
  tiktok:    "TikTok",
  youtube:   "YouTube",
  facebook:  "Facebook",
  instagram: "Instagram",
  twitter:   "X (Twitter)",
  telegram:  "Telegram",
};

/** Order status color mapping */
export const STATUS_COLORS: Record<string, string> = {
  PENDING:    "warning",
  PROCESSING: "info",
  COMPLETED:  "success",
  CANCELLED:  "danger",
  PARTIAL:    "warning",
  REFUNDED:   "default",
  FAILED:     "danger",
};
