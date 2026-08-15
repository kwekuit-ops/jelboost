"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
}

const sizes = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-4xl",
};

export function Modal({ isOpen, onClose, title, description, children, size = "md", closeOnBackdrop = true }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full rounded-2xl bg-white dark:bg-surface-card-dark border border-surface-border dark:border-surface-border-dark shadow-2xl z-10 overflow-hidden",
              sizes[size]
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between p-6 border-b border-surface-border dark:border-surface-border-dark">
                <div>
                  {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Confirm dialog
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", loading = false }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-surface-border dark:border-surface-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60",
              variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
            )}
          >
            {loading ? "Loading..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
