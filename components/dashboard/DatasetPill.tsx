"use client";

import { Database, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { formatBytes } from "@/lib/format";
import { useDataset } from "@/hooks/useDataset";

/** Compact "which dataset am I looking at" indicator. */
export function DatasetPill() {
  const { dataset, isDemo } = useDataset();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex max-w-[240px] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-ink-muted">
        <Database className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
        <span className="truncate text-ink">{dataset.meta.name}</span>
        <span className="shrink-0 text-ink-faint">
          {dataset.rowCount.toLocaleString()} rows | {formatBytes(dataset.meta.sizeBytes)}
        </span>
      </span>
      {isDemo ? (
        <Badge tone="violet" dot pulse>
          <Sparkles className="h-3 w-3" />
          DEMO MODE
        </Badge>
      ) : (
        <Badge tone="success" dot>
          Live dataset
        </Badge>
      )}
    </div>
  );
}
