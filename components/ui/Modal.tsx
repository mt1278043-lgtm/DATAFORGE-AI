"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl" | "full";
}

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[96vw] h-[92vh]",
};

export function Modal({ open, onClose, title, description, children, footer, size = "lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-base/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "glass-strong relative flex w-full flex-col overflow-hidden rounded-3xl",
              SIZES[size],
            )}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-violet/60 to-transparent" />
            {title ? (
              <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">{title}</h2>
                  {description ? (
                    <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
                  ) : null}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg border border-white/10 p-2 text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>
            ) : null}
            <div className="scroll-slim flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer ? (
              <footer className="flex items-center justify-end gap-3 border-t border-white/[0.07] px-6 py-4">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
