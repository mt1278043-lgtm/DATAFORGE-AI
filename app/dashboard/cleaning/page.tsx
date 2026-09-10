"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Eye, SlidersHorizontal, Sparkles, Wand2, X } from "lucide-react";

import { DataTable } from "@/components/data/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useDataset } from "@/hooks/useDataset";
import { useToast } from "@/hooks/useToast";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn, sleep } from "@/lib/utils";
import { applyCleaning, detectCleaningActions } from "@/services/cleaningService";
import type { CleaningActionId, CleaningResult } from "@/types";

export default function CleaningPage() {
  const { dataset, replaceDataset } = useDataset();
  const toast = useToast();

  const actions = useMemo(() => detectCleaningActions(dataset), [dataset]);
  const [ignored, setIgnored] = useState<CleaningActionId[]>([]);
  const [reviewing, setReviewing] = useState<CleaningActionId | null>(null);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [running, setRunning] = useState(false);

  const pending = actions.filter((action) => !ignored.includes(action.id));
  const reviewAction = actions.find((action) => action.id === reviewing);

  const runCleaning = async (ids: CleaningActionId[]) => {
    if (ids.length === 0) return;
    setRunning(true);
    try {
      await sleep(700);
      const outcome = applyCleaning(dataset, ids);
      setResult(outcome);
      toast.success(
        "Cleaning complete",
        `${formatNumber(outcome.changedCells)} cells changed. Quality ${outcome.before.qualityScore}% to ${outcome.after.qualityScore}%.`,
      );
    } catch {
      toast.error("Cleaning failed", "The dataset could not be cleaned. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const applyResult = () => {
    if (!result) return;
    replaceDataset(result.dataset);
    setResult(null);
    setIgnored([]);
    toast.success("Cleaned dataset applied", "Every page now reflects the cleaned data.");
  };

  const comparisonRows = result
    ? [
        { label: "Rows", before: result.before.rows, after: result.after.rows, invert: false },
        { label: "Columns", before: result.before.columns, after: result.after.columns, invert: false },
        { label: "Missing cells", before: result.before.missing, after: result.after.missing, invert: true },
        {
          label: "Duplicate rows",
          before: result.before.duplicates,
          after: result.after.duplicates,
          invert: true,
        },
        { label: "Outliers", before: result.before.outliers, after: result.after.outliers, invert: true },
        {
          label: "Quality score",
          before: result.before.qualityScore,
          after: result.after.qualityScore,
          invert: false,
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Data Cleaning"
        title="Fix what the quality scan found"
        description="Each action is detected from your dataset and previews exactly how many values it touches. Nothing is changed until you apply the result."
        actions={
          <Button
            icon={<Wand2 className="h-4 w-4" />}
            loading={running}
            disabled={pending.length === 0}
            onClick={() => void runCleaning(pending.map((action) => action.id))}
          >
            Fix Automatically
          </Button>
        }
      />

      <DatasetPill />

      {actions.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          title="This dataset is already clean"
          description="No missing values, duplicates, stray whitespace, type mismatches or outliers were detected."
        />
      ) : (
        <section className="grid gap-3">
          {actions.map((action, index) => {
            const isIgnored = ignored.includes(action.id);
            return (
              <motion.article
                key={action.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                className={cn(
                  "glass-strong flex flex-wrap items-center gap-4 p-5 transition-opacity duration-300",
                  isIgnored && "opacity-45",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    action.severity === "warning"
                      ? "border-warning/25 bg-warning/10 text-warning"
                      : "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </span>

                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-ink">{action.label}</h3>
                    <Badge tone={action.severity === "warning" ? "warning" : "cyan"}>
                      {formatNumber(action.affected)} affected
                    </Badge>
                    {isIgnored ? <Badge tone="neutral">Ignored</Badge> : null}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                    {action.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Wand2 className="h-3.5 w-3.5" />}
                    disabled={isIgnored || running}
                    onClick={() => void runCleaning([action.id])}
                  >
                    Fix
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => setReviewing(action.id)}
                  >
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<X className="h-3.5 w-3.5" />}
                    onClick={() =>
                      setIgnored((current) =>
                        current.includes(action.id)
                          ? current.filter((id) => id !== action.id)
                          : [...current, action.id],
                      )
                    }
                  >
                    {isIgnored ? "Restore" : "Ignore"}
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* Before / after ---------------------------------------------------- */}
      {result ? (
        <Card highlight>
          <CardHeader
            icon={<Sparkles className="h-4 w-4" />}
            title="Before and after"
            description={`${result.applied.length} action${result.applied.length === 1 ? "" : "s"} applied to a copy of your dataset`}
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                  Discard
                </Button>
                <Button size="sm" iconRight={<ArrowRight className="h-4 w-4" />} onClick={applyResult}>
                  Apply cleaned dataset
                </Button>
              </>
            }
          />
          <CardBody className="space-y-6">
            <div className="scroll-slim overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    <th className="py-2.5 pr-4 font-medium">Metric</th>
                    <th className="py-2.5 pr-4 font-medium">Before</th>
                    <th className="py-2.5 pr-4 font-medium">After</th>
                    <th className="py-2.5 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => {
                    const delta = row.after - row.before;
                    const improved = row.invert ? delta < 0 : delta > 0;
                    return (
                      <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                        <td className="py-3 pr-4 text-[13px] text-ink-muted">{row.label}</td>
                        <td className="py-3 pr-4 text-[13px] tabular-nums text-ink-faint">
                          {row.label === "Quality score"
                            ? formatPercent(row.before, 1)
                            : formatNumber(row.before)}
                        </td>
                        <td className="py-3 pr-4 text-[13px] font-medium tabular-nums text-ink">
                          {row.label === "Quality score"
                            ? formatPercent(row.after, 1)
                            : formatNumber(row.after)}
                        </td>
                        <td
                          className={cn(
                            "py-3 text-[13px] tabular-nums",
                            delta === 0 ? "text-ink-faint" : improved ? "text-success" : "text-danger",
                          )}
                        >
                          {delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${formatNumber(delta)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Cleaned data preview
              </p>
              <DataTable dataset={result.dataset} pageSize={10} />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Review modal ------------------------------------------------------ */}
      <Modal
        open={Boolean(reviewAction)}
        onClose={() => setReviewing(null)}
        title={reviewAction?.label}
        description={reviewAction?.description}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Close
            </Button>
            <Button
              icon={<Wand2 className="h-4 w-4" />}
              onClick={() => {
                if (reviewAction) void runCleaning([reviewAction.id]);
                setReviewing(null);
              }}
            >
              Fix this issue
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="warning">{formatNumber(reviewAction?.affected ?? 0)} values affected</Badge>
            <Badge tone="neutral">{dataset.rowCount.toLocaleString()} rows scanned</Badge>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Below is the current dataset. Nothing has been modified yet - applying a fix creates a new
            cleaned copy that you can review before it replaces the working dataset.
          </p>
          <DataTable dataset={dataset} pageSize={10} />
        </div>
      </Modal>
    </>
  );
}
