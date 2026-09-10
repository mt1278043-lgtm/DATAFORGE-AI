"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  Lightbulb,
  ShieldCheck,
  Sigma,
  Wand2,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress, ProgressRing } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";
import { useDataset } from "@/hooks/useDataset";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IssueSeverity } from "@/types";

const SEVERITY_META: Record<
  IssueSeverity,
  { tone: "danger" | "warning" | "cyan"; label: string; icon: typeof Info }
> = {
  critical: { tone: "danger", label: "Critical", icon: AlertTriangle },
  warning: { tone: "warning", label: "Warning", icon: AlertTriangle },
  info: { tone: "cyan", label: "Info", icon: Info },
};

export default function QualityPage() {
  const { dataset, quality } = useDataset();
  const [filter, setFilter] = useState("all");

  const metrics = [
    {
      label: "Missing Values",
      value: formatNumber(quality.missingValues),
      hint: `${formatPercent(dataset.stats.missingRate, 2)} of all cells`,
      icon: Sigma,
      tone: quality.missingValues === 0 ? "success" : "warning",
    },
    {
      label: "Duplicates",
      value: formatNumber(quality.duplicateRows),
      hint: `${formatPercent((quality.duplicateRows / Math.max(dataset.rowCount, 1)) * 100, 2)} of rows`,
      icon: Copy,
      tone: quality.duplicateRows === 0 ? "success" : "warning",
    },
    {
      label: "Invalid Values",
      value: formatNumber(quality.invalidValues),
      hint: "Cells failing their column type",
      icon: AlertTriangle,
      tone: quality.invalidValues === 0 ? "success" : "danger",
    },
    {
      label: "Outliers",
      value: formatNumber(quality.outliers),
      hint: "Beyond 1.5x the interquartile range",
      icon: ShieldCheck,
      tone: "cyan",
    },
  ] as const;

  const filtered =
    filter === "all" ? quality.issues : quality.issues.filter((issue) => issue.severity === filter);

  const counts = {
    critical: quality.issues.filter((issue) => issue.severity === "critical").length,
    warning: quality.issues.filter((issue) => issue.severity === "warning").length,
    info: quality.issues.filter((issue) => issue.severity === "info").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Data Quality"
        title="How much can you trust this dataset?"
        description="A weighted score across completeness, uniqueness, validity and consistency - with every issue traced back to a column."
        actions={
          <Button href="/dashboard/cleaning" icon={<Wand2 className="h-4 w-4" />}>
            Clean this dataset
          </Button>
        }
      />

      <DatasetPill />

      {/* Score + dimensions ------------------------------------------------ */}
      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card highlight className="flex flex-col items-center justify-center p-8">
          <ProgressRing
            value={quality.score}
            label={formatPercent(quality.score, 1)}
            sublabel={quality.grade}
          />
          <p className="mt-6 text-center text-[13px] leading-relaxed text-ink-muted">
            {quality.score >= 92
              ? "This dataset is reliable enough to drive decisions directly."
              : quality.score >= 80
                ? "Solid overall. Fix the issues below before publishing headline numbers."
                : "Handle with care - clean the dataset before drawing conclusions."}
          </p>
          <Badge
            tone={quality.score >= 92 ? "success" : quality.score >= 80 ? "cyan" : "warning"}
            className="mt-4"
          >
            {quality.issues.length} issue{quality.issues.length === 1 ? "" : "s"} detected
          </Badge>
        </Card>

        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className="glass-strong p-5"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                      {metric.label}
                    </p>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border",
                        metric.tone === "success" && "border-success/25 bg-success/10 text-success",
                        metric.tone === "warning" && "border-warning/25 bg-warning/10 text-warning",
                        metric.tone === "danger" && "border-danger/25 bg-danger/10 text-danger",
                        metric.tone === "cyan" && "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink-faint">{metric.hint}</p>
                </motion.div>
              );
            })}
          </section>

          <Card>
            <CardHeader title="Quality dimensions" description="Weighted 40 / 25 / 25 / 10" />
            <CardBody className="space-y-5">
              {quality.dimensions.map((dimension) => (
                <div key={dimension.key}>
                  <div className="mb-2 flex items-center justify-between text-[13px]">
                    <span className="text-ink">{dimension.label}</span>
                    <span className="tabular-nums text-ink-muted">
                      {formatPercent(dimension.score, 1)}
                    </span>
                  </div>
                  <Progress
                    value={dimension.score}
                    tone={dimension.score >= 90 ? "success" : dimension.score >= 75 ? "brand" : "warning"}
                    height="sm"
                  />
                  <p className="mt-1.5 text-[11.5px] text-ink-faint">{dimension.detail}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Issues ------------------------------------------------------------ */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Detected issues</h2>
          <Tabs
            layoutId="quality-tabs"
            items={[
              { value: "all", label: "All", count: quality.issues.length },
              { value: "critical", label: "Critical", count: counts.critical },
              { value: "warning", label: "Warning", count: counts.warning },
              { value: "info", label: "Info", count: counts.info },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            title="Nothing to flag here"
            description="No issues of this severity were found in the current dataset."
          />
        ) : (
          <div className="grid gap-3">
            {filtered.map((issue, index) => {
              const meta = SEVERITY_META[issue.severity];
              const Icon = meta.icon;
              return (
                <motion.article
                  key={issue.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                  className="glass-strong flex flex-wrap items-start gap-4 p-5"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                      issue.severity === "critical" && "border-danger/25 bg-danger/10 text-danger",
                      issue.severity === "warning" && "border-warning/25 bg-warning/10 text-warning",
                      issue.severity === "info" && "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-[240px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-ink">{issue.title}</h3>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {issue.autoFixable ? <Badge tone="success">Auto-fixable</Badge> : null}
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                      {issue.description}
                    </p>
                    <p className="mt-2 flex items-start gap-2 text-[12.5px] text-ink-faint">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-purple" />
                      {issue.suggestion}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[20px] font-semibold tabular-nums text-ink">
                      {formatNumber(issue.count)}
                    </p>
                    <p className="text-[11px] text-ink-faint">
                      {issue.kind === "duplicate" ? "rows" : "cells"}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommendations --------------------------------------------------- */}
      <Card highlight>
        <CardHeader
          icon={<Lightbulb className="h-4 w-4" />}
          title="Recommendations"
          description="Ordered by impact on the overall score"
          actions={
            <Button variant="secondary" size="sm" href="/dashboard/cleaning">
              Open cleaning
            </Button>
          }
        />
        <CardBody>
          <ul className="space-y-3">
            {quality.recommendations.map((recommendation, index) => (
              <li key={recommendation} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-brand-violet/25 bg-brand-violet/10 text-[10px] font-semibold text-brand-purple">
                  {index + 1}
                </span>
                <span className="text-[13.5px] leading-relaxed text-ink-muted">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </>
  );
}
