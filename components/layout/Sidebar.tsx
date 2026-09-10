"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { DASHBOARD_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onNavigate, mobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo idSuffix={mobile ? "mobile" : "sidebar"} />
        {mobile ? (
          <button
            onClick={onNavigate}
            aria-label="Close navigation"
            className="rounded-lg border border-white/10 p-2 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="divider" />

      <nav className="scroll-slim flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {DASHBOARD_NAV.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.description}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors duration-300",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={mobile ? "sidebar-active-mobile" : "sidebar-active"}
                  className="absolute inset-0 rounded-xl border border-white/[0.09] bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
                  active
                    ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan"
                    : "border-white/[0.07] bg-white/[0.02] text-ink-faint group-hover:text-ink-muted",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="relative flex-1 truncate font-medium">{item.label}</span>
              {item.badge ? (
                <Badge tone="violet" className="relative px-1.5 py-0.5 text-[10px]">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 pt-3">
        <div className="glass relative overflow-hidden rounded-2xl p-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-brand-violet/25 blur-2xl" />
          <p className="relative text-[13px] font-semibold text-ink">Upgrade to Scale</p>
          <p className="relative mt-1 text-[12px] leading-relaxed text-ink-muted">
            Unlimited datasets, model training and team workspaces.
          </p>
          <Link
            href="/#pricing"
            className="relative mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand-cyan transition-colors hover:text-brand-purple"
          >
            View plans
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
