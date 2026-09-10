"use client";

import type { ReactNode } from "react";

import { DatasetProvider } from "@/hooks/useDataset";
import { ToastProvider } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/Toaster";

/**
 * Single composition point for every client provider in the app.
 * Toasts wrap the dataset provider because uploads emit notifications.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DatasetProvider>
        {children}
        <Toaster />
      </DatasetProvider>
    </ToastProvider>
  );
}
