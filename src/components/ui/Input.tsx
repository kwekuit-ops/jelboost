"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, fullWidth = true, id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200",
              "px-4 py-2.5 text-sm",
              "border-surface-border dark:border-surface-border-dark",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              error && "border-red-400 focus:ring-red-400 focus:border-red-400",
              className
            )}
            style={{
              paddingLeft: leftIcon ? "3rem" : undefined,
              paddingRight: rightIcon ? "3rem" : undefined,
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, fullWidth = true, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 resize-none",
            "px-4 py-3 text-sm min-h-[120px]",
            "border-surface-border dark:border-surface-border-dark",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Select variant
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, fullWidth = true, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white transition-all duration-200 cursor-pointer",
            "px-4 py-2.5 text-sm",
            "border-surface-border dark:border-surface-border-dark",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            error && "border-red-400",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
