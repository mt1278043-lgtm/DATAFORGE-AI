"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
}

export function Tabs({ items, value, onChange, className, layoutId = "tab-pill" }: TabsProps) {
  return (
    <div
      className={cn(
        "no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.03] p-1",
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
              active ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.07]"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {item.label}
              {item.count !== undefined ? (
                <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-ink-muted">
                  {item.count}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
