"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Sparkles, Target, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const PANEL =
  "glass-strong noise relative overflow-hidden rounded-3xl p-5 sm:p-6 shadow-soft";

/* -------------------------------------------------------------------------- */
/*  Analytics                                                                 */
/* -------------------------------------------------------------------------- */

const GROUPED = [
  { label: "Electronics", a: 92, b: 64 },
  { label: "Home", a: 68, b: 48 },
  { label: "Apparel", a: 54, b: 39 },
  { label: "Accessories", a: 44, b: 28 },
  { label: "Outdoor", a: 33, b: 22 },
];

export function AnalyticsVisual() {
  return (
    <div className={PANEL}>
      <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/60 to-transparent" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-brand-cyan">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Revenue by Category</p>
            <p className="text-[11px] text-ink-faint">Sum of Revenue | grouped by Category</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {["Line", "Bar", "Area", "Pie"].map((type, index) => (
            <span
              key={type}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[11px]",
                index === 1
                  ? "border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan"
                  : "border-white/[0.08] text-ink-faint",
              )}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        {GROUPED.map((row, index) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
              <span className="text-ink-muted">{row.label}</span>
              <span className="tabular-nums text-ink-faint">{row.a}k</span>
            </div>
            <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${row.a}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-full bg-[linear-gradient(90deg,#22D3EE,#8B5CF6)]"
              />
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${row.b / 4}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.15 + index * 0.09 }}
                className="rounded-full bg-brand-pink/50"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-center">
        {[
          { label: "X Axis", value: "Category" },
          { label: "Y Axis", value: "Revenue" },
          { label: "Aggregation", value: "Sum" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">{item.label}</p>
            <p className="mt-1 text-[12.5px] font-medium text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AI insights                                                               */
/* -------------------------------------------------------------------------- */

const INSIGHTS = [
  {
    icon: TrendingUp,
    tag: "Revenue Trend",
    body: "Revenue increased 18.7% over the selected period.",
    tone: "text-success",
    metric: "+18.7%",
  },
  {
    icon: AlertTriangle,
    tag: "Customer Retention",
    body: "Returning customers decreased by 8.2%.",
    tone: "text-danger",
    metric: "-8.2%",
  },
  {
    icon: Target,
    tag: "Opportunity",
    body: "Product A has the strongest conversion rate.",
    tone: "text-brand-cyan",
    metric: "4.9x",
  },
];

export function InsightsVisual() {
  return (
    <div className={PANEL}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-brand-violet/20 blur-3xl" />

      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-violet/25 bg-brand-violet/10 text-brand-purple">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-ink">AI Insights</p>
          <p className="text-[11px] text-ink-faint">Generated from 486,204 analysed rows</p>
        </div>
      </div>

      <div className="space-y-3">
        {INSIGHTS.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.tag}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", insight.tone)} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    {insight.tag}
                  </span>
                </div>
                <span className={cn("text-[13px] font-semibold tabular-nums", insight.tone)}>
                  {insight.metric}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink">{insight.body}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-brand-cyan"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.18 }}
            />
          ))}
        </div>
        <p className="text-[12px] text-ink-muted">Scanning for anomalies across 9 columns...</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Predictions                                                               */
/* -------------------------------------------------------------------------- */

const HISTORY = [30, 34, 32, 41, 44, 42, 51, 55, 53, 62, 66, 71];
const FORECAST = [74, 78, 82, 87, 91];

export function PredictionsVisual() {
  const all = [...HISTORY, ...FORECAST];
  const max = Math.max(...all);

  return (
    <div className={PANEL}>
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-brand-pink/15 blur-3xl" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13.5px] font-semibold text-ink">Revenue Forecast</p>
          <p className="text-[11px] text-ink-faint">Linear trend | 95% confidence band</p>
        </div>
        <span className="rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[10.5px] font-medium text-warning">
          SIMULATED
        </span>
      </div>

      <div className="flex h-44 items-end gap-1.5">
        {all.map((value, index) => {
          const forecast = index >= HISTORY.length;
          return (
            <motion.div
              key={index}
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: `${(value / max) * 100}%`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex-1 rounded-t-[4px]",
                forecast
                  ? "border border-dashed border-brand-pink/50 bg-brand-pink/15"
                  : "bg-[linear-gradient(180deg,#8B5CF6,rgba(34,211,238,0.35))]",
              )}
            />
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
        {[
          { label: "Model", value: "Trend" },
          { label: "R squared", value: "0.94" },
          { label: "Horizon", value: "5 periods" },
          { label: "Trend", value: "+18.7%" },
        ].map((metric) => (
          <div key={metric.label}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">{metric.label}</p>
            <p className="mt-1 text-[13px] font-medium tabular-nums text-ink">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
