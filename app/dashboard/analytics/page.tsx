"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart } from "lucide-react";

import { ChartCard } from "@/components/charts/ChartCard";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { useDataset } from "@/hooks/useDataset";
import { CHART_TYPES } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import {
  aggregateSeries,
  primaryCategoryColumn,
  primaryDateColumn,
  primaryMetricColumn,
} from "@/services/analyticsService";
import type { Aggregation, ChartType } from "@/types";

const AGGREGATIONS: { value: Aggregation; label: string }[] = [
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "count", label: "Count" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

export default function AnalyticsPage() {
  const { dataset } = useDataset();

  const numericColumns = useMemo(
    () => dataset.columns.filter((column) => column.type === "numeric").map((column) => column.name),
    [dataset],
  );
  const groupableColumns = useMemo(
    () =>
      dataset.columns
        .filter((column) => column.type !== "empty")
        .map((column) => column.name),
    [dataset],
  );

  const defaultX = primaryDateColumn(dataset) ?? primaryCategoryColumn(dataset) ?? groupableColumns[0] ?? "";
  const defaultY = primaryMetricColumn(dataset) ?? numericColumns[0] ?? "";

  const [xKey, setXKey] = useState(defaultX);
  const [yKey, setYKey] = useState(defaultY);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [aggregation, setAggregation] = useState<Aggregation>("sum");

  // Reset the controls whenever a new dataset is loaded.
  useEffect(() => {
    setXKey(defaultX);
    setYKey(defaultY);
  }, [dataset.meta.id, defaultX, defaultY]);

  const isScatter = chartType === "scatter";
  const xOptions = (isScatter ? numericColumns : groupableColumns).map((name) => ({
    value: name,
    label: name,
  }));

  const series = useMemo(
    () =>
      xKey && yKey
        ? aggregateSeries(dataset, { xKey, yKey, aggregation, chartType })
        : [],
    [dataset, xKey, yKey, aggregation, chartType],
  );

  const secondary = useMemo(() => {
    const category = primaryCategoryColumn(dataset);
    if (!category || !yKey) return [];
    return aggregateSeries(dataset, {
      xKey: category,
      yKey,
      aggregation: "sum",
      chartType: "pie",
      limit: 8,
    });
  }, [dataset, yKey]);

  const distribution = useMemo(() => {
    if (!yKey) return [];
    const profile = dataset.columns.find((column) => column.name === yKey);
    if (!profile?.numeric) return [];
    const { min, max } = profile.numeric;
    const buckets = 12;
    const width = (max - min) / buckets || 1;
    const counts = new Array(buckets).fill(0);
    for (const row of dataset.rows) {
      const value = Number(row[yKey]);
      if (!Number.isFinite(value)) continue;
      const index = Math.min(buckets - 1, Math.max(0, Math.floor((value - min) / width)));
      counts[index] += 1;
    }
    return counts.map((count, index) => ({
      label: `${Math.round(min + index * width)}`,
      value: count,
    }));
  }, [dataset, yKey]);

  if (numericColumns.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Analytics"
          title="Analytics workspace"
          description="Compose charts from any two columns in your dataset."
        />
        <EmptyState
          icon={<LineChart className="h-5 w-5" />}
          title="No numeric columns to chart"
          description="This dataset has no numeric measures. Upload a file with at least one numeric column to build charts."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Analytics workspace"
        description="Pick the axes, the aggregation and the chart type. Every view is rebuilt from your actual rows."
      />

      <DatasetPill />

      <Card highlight>
        <CardHeader
          icon={<LineChart className="h-4 w-4" />}
          title="Chart builder"
          description="Scatter plots require two numeric columns; every other type groups by the X column."
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              label="X Axis"
              value={xKey}
              onChange={setXKey}
              options={xOptions}
              hint={isScatter ? "Numeric columns only" : "Grouping column"}
            />
            <Select
              label="Y Axis"
              value={yKey}
              onChange={setYKey}
              options={numericColumns.map((name) => ({ value: name, label: name }))}
              hint="Measure to aggregate"
            />
            <Select
              label="Chart Type"
              value={chartType}
              onChange={(value) => setChartType(value as ChartType)}
              options={CHART_TYPES.map((type) => ({ value: type.value, label: type.label }))}
              hint="Five visual encodings"
            />
            <Select
              label="Aggregation"
              value={aggregation}
              onChange={(value) => setAggregation(value as Aggregation)}
              options={AGGREGATIONS}
              disabled={isScatter}
              hint={isScatter ? "Not used for scatter" : "How Y is reduced"}
            />
          </div>
        </CardBody>
      </Card>

      <ChartCard
        title={`${titleCase(yKey || "Value")} by ${titleCase(xKey || "Category")}`}
        description={`${AGGREGATIONS.find((a) => a.value === aggregation)?.label ?? "Sum"} of ${yKey} grouped by ${xKey}`}
        data={series}
        type={chartType}
        yLabel={yKey}
        xLabel={xKey}
        height={380}
        footer={`${series.length} plotted point${series.length === 1 ? "" : "s"} from ${dataset.rowCount.toLocaleString()} rows`}
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title={`Composition of ${titleCase(yKey || "value")}`}
          description="Share of the total across the most granular categorical column"
          data={secondary}
          type="pie"
          yLabel={yKey}
          height={320}
        />
        <ChartCard
          title={`Distribution of ${titleCase(yKey || "value")}`}
          description="Row counts across twelve equal-width buckets"
          data={distribution}
          type="bar"
          yLabel="Rows"
          xLabel={yKey}
          height={320}
        />
      </section>
    </>
  );
}
