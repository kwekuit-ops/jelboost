"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  gradient?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = true, glow = false, glass = false, gradient = false, padding = "md", ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2 } : {}}
        transition={{ duration: 0.2 }}
        className={cn(
          "rounded-2xl border transition-all duration-200",
          glass
            ? "glass"
            : "bg-white dark:bg-[#0f1c2e] border-slate-200 dark:border-slate-800 shadow-sm",
          gradient && "bg-brand-50 dark:bg-brand-950/40",
          glow && "shadow-glow",
          hover && "hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/50",
          paddings[padding],
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-gray-900 dark:text-white font-display", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
