"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== Infinity) {
      const timer = setTimeout(
        () => removeToast(id),
        toast.duration || 4000
      );
      return () => clearTimeout(timer);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-brand-purple" />,
    info: <Info className="w-5 h-5 text-brand-cyan" />,
  };

  const bgMap = {
    success: "bg-success/10 border-success/30",
    error: "bg-danger/10 border-danger/30",
    warning: "bg-brand-purple/10 border-brand-purple/30",
    info: "bg-brand-cyan/10 border-brand-cyan/30",
  };

  const textColorMap = {
    success: "text-success",
    error: "text-danger",
    warning: "text-brand-purple",
    info: "text-brand-cyan",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className={`${bgMap[toast.type]} border rounded-lg p-4 max-w-sm pointer-events-auto backdrop-blur-lg`}
    >
      <div className="flex gap-3">
        {iconMap[toast.type]}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${textColorMap[toast.type]}`}>
            {toast.title}
          </h3>
          {toast.message && (
            <p className="text-xs text-ink-muted mt-1 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-ink-muted hover:text-white transition mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
