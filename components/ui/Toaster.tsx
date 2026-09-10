"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { ToastVariant } from "@/types";

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES: Record<ToastVariant, string> = {
  success: "text-success border-success/25",
  error: "text-danger border-danger/25",
  warning: "text-warning border-warning/25",
  info: "text-brand-cyan border-brand-cyan/25",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-[88px] right-5 z-[200] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5",
                TONES[toast.variant],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
