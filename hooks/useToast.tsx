"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { uid } from "@/lib/utils";
import type { Toast, ToastVariant } from "@/types";

interface ToastContextValue {
  toasts: Toast[];
  notify: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = uid("toast");
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      const duration = toast.duration ?? DEFAULT_DURATION;
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const helper = useCallback(
    (variant: ToastVariant) => (title: string, description?: string) =>
      notify({ title, description, variant }),
    [notify],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      notify,
      dismiss,
      success: helper("success"),
      error: helper("error"),
      info: helper("info"),
      warning: helper("warning"),
    }),
    [toasts, notify, dismiss, helper],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}
