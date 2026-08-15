"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple";
type BadgeSize    = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info:    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  purple:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({ className, variant = "default", size = "md", dot = false, pulse = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full bg-current", pulse && "animate-ping")} />
      )}
      {children}
    </span>
  );
}

// Order status badge
const statusBadgeMap: Record<string, BadgeVariant> = {
  PENDING:    "warning",
  PROCESSING: "info",
  COMPLETED:  "success",
  CANCELLED:  "danger",
  PARTIAL:    "warning",
  REFUNDED:   "purple",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusBadgeMap[status] ?? "default";
  const isActive = status === "PROCESSING";

  return (
    <Badge variant={variant} dot pulse={isActive}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

// Quality badge
const qualityMap: Record<string, BadgeVariant> = {
  "Premium":      "purple",
  "High Quality": "primary",
  "Instant":      "success",
  "Standard":     "default",
};

export function QualityBadge({ quality }: { quality: string }) {
  const variant = qualityMap[quality] ?? "default";
  return <Badge variant={variant} size="sm">⭐ {quality}</Badge>;
}
