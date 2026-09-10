"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Minus,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Insight, InsightCategory } from "@/types";

const CATEGORY_META: Record<
  InsightCategory,
  { icon: LucideIcon; label: string; tone: "cyan" | "violet" | "pink" | "success" | "warning" }
> = {
  finding: { icon: Search, label: "Key Finding", tone: "cyan" },
  trend: { icon: TrendingUp, label: "Trend", tone: "violet" },
  anomaly: { icon: AlertTriangle, label: "Anomaly", tone: "warning" },
  opportunity: { icon: Target, label: "Opportunity", tone: "success" },
  recommendation: { icon: Lightbulb, label: "Recommendation", tone: "pink" },
};

interface InsightCardProps {
  insight: Insight;
  index?: number;
  compact?: boolean;
}

export function InsightCard({ insight, index = 0, compact }: InsightCardProps) {
  const meta = CATEGORY_META[insight.category];
  const Icon = meta.icon;
  const DirectionIcon =
    insight.direction === "up" ? ArrowUpRight : insight.direction === "down" ? ArrowDownRight : Minus;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.5), ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong glass-hover group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-brand-cyan/[0.07] blur-3xl transition-all duration-700 group-hover:bg-brand-violet/15" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-brand-cyan">
            <Icon className="h-4 w-4" />
          </span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        {insight.metric ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[15px] font-semibold tracking-[-0.01em]",
              insight.direction === "up"
                ? "text-success"
                : insight.direction === "down"
                  ? "text-danger"
                  : "text-ink",
            )}
          >
            <DirectionIcon className="h-4 w-4" />
            {insight.metric}
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {insight.title}
      </h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-ink">{insight.summary}</p>

      {!compact && insight.evidence.length > 0 ? (
        <ul className="relative mt-4 space-y-1.5 border-t border-white/[0.06] pt-4">
          {insight.evidence.map((item) => (
            <li key={item} className="flex gap-2.5 text-[12.5px] text-ink-muted">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-violet" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative mt-4 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#22D3EE,#8B5CF6)]"
            initial={{ width: 0 }}
            animate={{ width: `${insight.confidence * 100}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {Math.round(insight.confidence * 100)}% confidence
        </span>
      </div>
    </motion.article>
  );
}
