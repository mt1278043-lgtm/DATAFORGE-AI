"use client";

import type { TooltipProps } from "recharts";

import { formatNumber } from "@/lib/format";

/** Shared glass tooltip used by every chart in the product. */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-strong rounded-xl border border-white/10 px-3.5 py-2.5 shadow-soft">
      {label !== undefined && label !== "" ? (
        <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-faint">{String(label)}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2.5 text-[13px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color ?? "#22D3EE" }}
            />
            <span className="text-ink-muted">{entry.name}</span>
            <span className="ml-auto font-medium text-ink">
              {typeof entry.value === "number" ? formatNumber(entry.value) : String(entry.value ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
