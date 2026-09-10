import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Analyse, clean, forecast and report on your datasets.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
