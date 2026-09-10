"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, FileSpreadsheet, Hash, Type } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { COLUMN_TYPE_STYLES } from "@/lib/constants";
import { formatBytes, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Dataset } from "@/types";

interface DatasetSummaryProps {
  dataset: Dataset;
  onAnalyze?: () => void;
}

const TYPE_ICONS = {
  numeric: Hash,
  categorical: Type,
  date: CalendarDays,
  boolean: Type,
  empty: Type,
};

/** Post-upload summary: file facts, column types and the call to analyse. */
export function DatasetSummary({ dataset, onAnalyze }: DatasetSummaryProps) {
  const router = useRouter();

  const facts = [
    { label: "Filename", value: dataset.meta.name },
    { label: "File size", value: formatBytes(dataset.meta.sizeBytes) },
    { label: "Rows", value: formatNumber(dataset.rowCount) },
    { label: "Columns", value: String(dataset.columnCount) },
    { label: "Missing", value: `${formatNumber(dataset.stats.missingCells)} cells` },
    { label: "Duplicates", value: `${formatNumber(dataset.stats.duplicateRows)} rows` },
    { label: "Uploaded", value: formatDate(dataset.meta.createdAt, true) },
    {
      label: "Source",
      value: dataset.meta.source === "demo" ? "Built-in demo" : String(dataset.meta.fileType).toUpperCase(),
    },
  ];

  return (
    <Card highlight>
      <CardHeader
        icon={<FileSpreadsheet className="h-4 w-4" />}
        title={dataset.meta.name}
        description={`${formatNumber(dataset.rowCount)} rows | ${dataset.columnCount} columns | ${formatBytes(dataset.meta.sizeBytes)}`}
        actions={
          <Button
            size="sm"
            iconRight={<ArrowRight className="h-4 w-4" />}
            onClick={() => (onAnalyze ? onAnalyze() : router.push("/dashboard"))}
          >
            Analyze Dataset
          </Button>
        }
      />
      <CardBody className="space-y-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">{fact.label}</dt>
              <dd className="mt-1 truncate text-[14px] font-medium text-ink" title={fact.value}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            Detected data types
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dataset.columns.map((column, index) => {
              const style = COLUMN_TYPE_STYLES[column.type];
              const Icon = TYPE_ICONS[column.type] ?? Type;
              return (
                <motion.div
                  key={column.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                      style?.className,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{column.name}</p>
                    <p className="truncate text-[11px] text-ink-faint">
                      {style?.label} | {formatNumber(column.unique)} unique
                      {column.missing > 0 ? ` | ${formatPercent(column.missingRate, 1)} missing` : ""}
                    </p>
                  </div>
                  {column.missing > 0 ? (
                    <Badge tone="warning" className="shrink-0 px-1.5 py-0 text-[10px]">
                      {formatNumber(column.missing)}
                    </Badge>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
