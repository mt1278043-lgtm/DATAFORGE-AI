"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { Sparkline } from "@/components/charts/Sparkline";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KpiDefinition } from "@/types";

interface KpiCardProps {
  kpi: KpiDefinition;
  index?: number;
}

function formatterFor(kpi: KpiDefinition): (value: number) => string {
  if (kpi.id === "data-quality") return (value) => formatPercent(value, 1);
  if (kpi.formatted.startsWith("$")) return (value) => formatCurrency(value);
  return (value) => formatNumber(Math.round(value), { compact: true });
}

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const positive = kpi.change > 0.05;
  const negative = kpi.change < -0.05;
  const isQuality = kpi.id === "data-quality";

  const TrendIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const trendTone = isQuality
    ? "text-brand-cyan"
    : positive
      ? "text-success"
      : negative
        ? "text-danger"
        : "text-ink-faint";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong glass-hover group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-violet/10 blur-3xl transition-opacity duration-700 group-hover:bg-brand-violet/20" />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">{kpi.label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium",
            trendTone,
          )}
        >
          <TrendIcon className="h-3 w-3" aria-hidden />
          {isQuality ? kpi.changeLabel : `${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%`}
        </span>
      </div>

      <p className="relative mt-3 text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
        <AnimatedNumber value={kpi.value} format={formatterFor(kpi)} delay={index * 90} />
      </p>

      <p className="relative mt-1 text-[12px] text-ink-faint">{kpi.hint}</p>

      <div className="relative mt-4 -mb-1">
        <Sparkline
          data={kpi.spark}
          tone={isQuality ? "violet" : positive ? "success" : negative ? "danger" : "cyan"}
          height={38}
        />
      </div>
    </motion.article>
  );
}
