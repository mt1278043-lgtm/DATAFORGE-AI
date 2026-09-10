"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, UploadCloud } from "lucide-react";

import { ChartCard } from "@/components/charts/ChartCard";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { SkeletonCard, SkeletonChart } from "@/components/ui/Skeleton";
import { useDataset } from "@/hooks/useDataset";
import { formatPercent, greetingForNow } from "@/lib/format";
import {
  aggregateSeries,
  primaryCategoryColumn,
  primaryDateColumn,
  primaryMetricColumn,
} from "@/services/analyticsService";

export default function OverviewPage() {
  const { dataset, kpis, insights, quality, isDemo } = useDataset();
  const [mounted, setMounted] = useState(false);

  // Greeting depends on the local clock, so render it after hydration.
  useEffect(() => setMounted(true), []);

  const metric = primaryMetricColumn(dataset);
  const dateColumn = primaryDateColumn(dataset);
  const category = primaryCategoryColumn(dataset);

  const trendSeries = useMemo(() => {
    if (!metric) return [];
    return aggregateSeries(dataset, {
      xKey: dateColumn ?? dataset.columns[0]?.name ?? "",
      yKey: metric,
      aggregation: "sum",
      chartType: "area",
      limit: 60,
    });
  }, [dataset, metric, dateColumn]);

  const categorySeries = useMemo(() => {
    if (!metric || !category) return [];
    return aggregateSeries(dataset, {
      xKey: category,
      yKey: metric,
      aggregation: "sum",
      chartType: "bar",
      limit: 8,
    });
  }, [dataset, metric, category]);

  return (
    <>
      <PageHeader
        eyebrow={mounted ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Workspace"}
        title={
          <span suppressHydrationWarning>
            {mounted ? greetingForNow() : "Welcome"} <span className="ml-1">&#128075;</span>
          </span>
        }
        description="Here's what your data is telling you."
        actions={
          <>
            <Button variant="secondary" href="/dashboard/datasets" icon={<UploadCloud className="h-4 w-4" />}>
              Upload dataset
            </Button>
            <Button href="/dashboard/insights" iconRight={<ArrowRight className="h-4 w-4" />}>
              View AI insights
            </Button>
          </>
        }
      />

      <DatasetPill />

      {/* KPIs -------------------------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.length === 0
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          : kpis.map((kpi, index) => <KpiCard key={kpi.id} kpi={kpi} index={index} />)}
      </section>

      {/* Charts ------------------------------------------------------------ */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {metric ? (
          <ChartCard
            title={`${metric} over ${dateColumn ?? "records"}`}
            description={
              dateColumn
                ? `Sum of ${metric} aggregated by ${dateColumn}`
                : `Sum of ${metric} across the dataset`
            }
            data={trendSeries}
            type="area"
            yLabel={metric}
            height={300}
            footer={`${trendSeries.length} aggregated periods from ${dataset.rowCount.toLocaleString()} rows`}
          />
        ) : (
          <SkeletonChart />
        )}

        {category && metric ? (
          <ChartCard
            title={`${metric} by ${category}`}
            description={`Top ${categorySeries.length} groups by total ${metric.toLowerCase()}`}
            data={categorySeries}
            type="bar"
            yLabel={metric}
            height={300}
          />
        ) : (
          <SkeletonChart />
        )}
      </section>

      {/* Insights + quality ------------------------------------------------ */}
      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
              <Sparkles className="h-4 w-4 text-brand-purple" />
              Top signals
            </h2>
            <Link
              href="/dashboard/insights"
              className="text-[12.5px] text-ink-muted transition-colors hover:text-ink"
            >
              View all {insights.length}
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {insights.slice(0, 2).map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} compact />
            ))}
            {insights.length === 0 ? (
              <Card className="p-6 text-[13.5px] text-ink-muted">
                No signals were detected in this dataset yet. Upload a richer file to unlock trend and
                anomaly detection.
              </Card>
            ) : null}
          </div>
        </div>

        <Card highlight>
          <CardHeader
            title="Data quality"
            description={`${quality.grade} - ${quality.issues.length} issue${quality.issues.length === 1 ? "" : "s"} detected`}
            actions={
              <Badge tone={quality.score >= 90 ? "success" : quality.score >= 75 ? "warning" : "danger"}>
                {formatPercent(quality.score, 1)}
              </Badge>
            }
          />
          <CardBody className="space-y-4">
            {quality.dimensions.map((dimension) => (
              <div key={dimension.key}>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-muted">{dimension.label}</span>
                  <span className="tabular-nums text-ink">{formatPercent(dimension.score, 1)}</span>
                </div>
                <Progress
                  value={dimension.score}
                  height="sm"
                  tone={dimension.score >= 90 ? "success" : dimension.score >= 75 ? "brand" : "warning"}
                />
                <p className="mt-1.5 text-[11px] text-ink-faint">{dimension.detail}</p>
              </div>
            ))}
            <Button variant="secondary" href="/dashboard/quality" className="w-full">
              Open data quality
            </Button>
          </CardBody>
        </Card>
      </section>

      {isDemo ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-brand-violet/25 bg-brand-violet/10 text-brand-purple">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">You are exploring the demo dataset</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Every figure above is computed from a generated e-commerce dataset. Upload your own file
                to analyse real data.
              </p>
            </div>
          </div>
          <Button href="/dashboard/datasets" icon={<UploadCloud className="h-4 w-4" />}>
            Upload your dataset
          </Button>
        </Card>
      ) : null}
    </>
  );
}
