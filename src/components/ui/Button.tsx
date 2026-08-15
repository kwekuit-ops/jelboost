"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size    = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  gradient?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-brand-600 hover:bg-brand-700 text-white shadow-brand hover:shadow-brand-lg",
  secondary: "bg-brand-100 hover:bg-brand-200 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60",
  outline:   "border-2 border-brand-500 text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-950",
  ghost:     "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
  danger:    "bg-red-600 hover:bg-red-700 text-white",
  success:   "bg-emerald-600 hover:bg-emerald-700 text-white",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm gap-1.5",
  md: "min-h-11 px-5 py-2.5 text-sm gap-2",
  lg: "min-h-12 px-6 py-3 text-base gap-2",
  xl: "min-h-14 px-8 py-4 text-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      gradient = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const gradientClass = gradient
      ? "bg-brand-600 hover:bg-brand-700 border-none text-white"
      : "";

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none whitespace-nowrap",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          gradient && gradientClass,
          className
        )}
        disabled={isDisabled}
        {...(props as any)}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />
        )}
        {!loading && icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
