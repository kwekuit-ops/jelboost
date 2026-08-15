"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      size={sizes[size]}
      className={cn("animate-spin text-brand-500", className)}
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-surface-border dark:border-surface-border-dark p-6 space-y-4">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}
