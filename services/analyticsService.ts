import { LIMITS } from "@/lib/constants";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { mean, percentChange, sum } from "@/lib/stats";
import { round, titleCase } from "@/lib/utils";
import { toDate, toNumber } from "@/services/profiler";
import { analyzeQuality } from "@/services/qualityService";
import type {
  Aggregation,
  ChartPoint,
  ChartType,
  Dataset,
  DatasetRow,
  KpiDefinition,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*  Aggregation                                                               */
/* -------------------------------------------------------------------------- */

function reduceValues(values: number[], aggregation: Aggregation): number {
  if (values.length === 0) return 0;
  switch (aggregation) {
    case "sum":
      return sum(values);
    case "avg":
      return mean(values);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "count":
    default:
      return values.length;
  }
}

export interface AggregateOptions {
  xKey: string;
  yKey: string;
  aggregation: Aggregation;
  chartType: ChartType;
  limit?: number;
}

/**
 * Groups rows by the X column and reduces the Y column with the chosen
 * aggregation. Scatter plots bypass grouping and return raw pairs.
 */
export function aggregateSeries(dataset: Dataset, options: AggregateOptions): ChartPoint[] {
  const { xKey, yKey, aggregation, chartType } = options;
  const limit = options.limit ?? LIMITS.maxChartCategories;
  if (!xKey || !yKey) return [];

  const xProfile = dataset.columns.find((c) => c.name === xKey);
  const isDateAxis = xProfile?.type === "date";

  if (chartType === "scatter") {
    const points: ChartPoint[] = [];
    for (const row of dataset.rows) {
      const x = toNumber(row[xKey]);
      const y = toNumber(row[yKey]);
      if (x === null || y === null) continue;
      points.push({ label: String(x), value: round(y, 4), x: round(x, 4) });
      if (points.length >= 800) break;
    }
    return points;
  }

  const buckets = new Map<string, number[]>();
  const order: string[] = [];

  for (const row of dataset.rows) {
    const rawX = row[xKey];
    if (rawX === null || rawX === undefined || rawX === "") continue;
    const key = isDateAxis ? normalizeDateKey(rawX) : String(rawX).trim();
    if (!key) continue;

    const y = aggregation === "count" ? 1 : toNumber(row[yKey]);
    if (aggregation !== "count" && y === null) continue;

    const bucket = buckets.get(key);
    if (bucket) bucket.push(y ?? 1);
    else {
      buckets.set(key, [y ?? 1]);
      order.push(key);
    }
  }

  let points: ChartPoint[] = order.map((label) => ({
    label,
    value: round(reduceValues(buckets.get(label) ?? [], aggregation), 2),
  }));

  if (isDateAxis) {
    points.sort((a, b) => a.label.localeCompare(b.label));
    if (points.length > limit) points = downsample(points, limit);
  } else {
    points.sort((a, b) => b.value - a.value);
    if (points.length > limit) {
      const head = points.slice(0, limit - 1);
      const tail = points.slice(limit - 1);
      head.push({ label: "Other", value: round(sum(tail.map((p) => p.value)), 2) });
      points = head;
    }
  }

  return points;
}

function normalizeDateKey(value: unknown): string {
  const date = toDate(value as never);
  if (!date) return String(value ?? "").trim();
  return date.toISOString().slice(0, 10);
}

/** Keeps the shape of a long series while limiting rendered points. */
function downsample(points: ChartPoint[], target: number): ChartPoint[] {
  const step = Math.ceil(points.length / target);
  const out: ChartPoint[] = [];
  for (let i = 0; i < points.length; i += step) {
    const slice = points.slice(i, i + step);
    out.push({
      label: slice[0].label,
      value: round(sum(slice.map((p) => p.value)), 2),
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Column heuristics                                                         */
/* -------------------------------------------------------------------------- */

const SEMANTIC_HINTS: Record<string, string[]> = {
  revenue: ["revenue", "sales", "amount", "total", "gmv", "income", "turnover", "price"],
  orders: ["order", "transaction", "purchase", "quantity", "units", "qty"],
  customers: ["customer", "user", "client", "buyer", "visitor", "subscriber"],
  spend: ["spend", "cost", "budget", "expense", "marketing"],
  rate: ["rate", "ratio", "percent", "conversion", "ctr", "margin"],
};

export function findColumn(dataset: Dataset, kind: keyof typeof SEMANTIC_HINTS): string | null {
  const hints = SEMANTIC_HINTS[kind];
  const numeric = dataset.columns.filter((c) => c.type === "numeric");
  const match = numeric.find((c) => hints.some((h) => c.name.toLowerCase().includes(h)));
  return match?.name ?? null;
}

export function primaryDateColumn(dataset: Dataset): string | null {
  return dataset.stats.dateColumns[0] ?? null;
}

export function primaryMetricColumn(dataset: Dataset): string | null {
  return (
    findColumn(dataset, "revenue") ??
    dataset.columns.find((c) => c.type === "numeric" && (c.numeric?.max ?? 0) > 0)?.name ??
    null
  );
}

export function primaryCategoryColumn(dataset: Dataset): string | null {
  const candidates = dataset.columns.filter(
    (c) =>
      (c.type === "categorical" || c.type === "boolean") &&
      c.unique > 1 &&
      c.unique <= Math.max(30, dataset.rowCount * 0.2),
  );
  return candidates.sort((a, b) => a.unique - b.unique)[0]?.name ?? null;
}

/* -------------------------------------------------------------------------- */
/*  KPIs                                                                      */
/* -------------------------------------------------------------------------- */

function sparkFor(dataset: Dataset, column: string, buckets = 14): number[] {
  const dateColumn = primaryDateColumn(dataset);
  const series = dateColumn
    ? aggregateSeries(dataset, {
        xKey: dateColumn,
        yKey: column,
        aggregation: "sum",
        chartType: "line",
        limit: buckets,
      })
    : dataset.rows
        .slice(0, buckets)
        .map((row, i) => ({ label: String(i), value: toNumber(row[column]) ?? 0 }));
  return series.map((p) => p.value);
}

/** Period-over-period change using the first vs. second half of the series. */
function changeFor(dataset: Dataset, column: string): number {
  const spark = sparkFor(dataset, column, 24).filter((v) => Number.isFinite(v));
  if (spark.length < 4) return 0;
  const half = Math.floor(spark.length / 2);
  return round(percentChange(sum(spark.slice(0, half)), sum(spark.slice(half))), 1);
}

function columnTotal(dataset: Dataset, column: string): number {
  const profile = dataset.columns.find((c) => c.name === column);
  return profile?.numeric?.sum ?? 0;
}

/**
 * Builds the four headline KPI cards. Values are always real column
 * aggregates; the labels adapt to whichever columns the dataset contains.
 */
export function deriveKpis(dataset: Dataset): KpiDefinition[] {
  const quality = analyzeQuality(dataset);
  const kpis: KpiDefinition[] = [];

  const revenueColumn = findColumn(dataset, "revenue");
  const ordersColumn = findColumn(dataset, "orders");
  const customersColumn = findColumn(dataset, "customers");

  const used = new Set<string>();

  const pushNumeric = (column: string | null, label: string, currency: boolean, hint: string) => {
    if (!column || used.has(column)) return;
    used.add(column);
    const total = columnTotal(dataset, column);
    const change = changeFor(dataset, column);
    kpis.push({
      id: column,
      label,
      value: total,
      formatted: currency ? formatCurrency(total) : formatNumber(total, { compact: true }),
      change,
      changeLabel: "vs. previous period",
      hint,
      spark: sparkFor(dataset, column),
    });
  };

  pushNumeric(revenueColumn, titleCase(revenueColumn ?? "Revenue"), true, "Sum across every row");
  pushNumeric(customersColumn, titleCase(customersColumn ?? "Customers"), false, "Total recorded");
  pushNumeric(ordersColumn, titleCase(ordersColumn ?? "Orders"), false, "Total recorded");

  // Fill any remaining slots with the largest numeric columns available.
  const fallback = dataset.columns
    .filter((c) => c.type === "numeric" && !used.has(c.name))
    .sort((a, b) => (b.numeric?.sum ?? 0) - (a.numeric?.sum ?? 0));

  for (const column of fallback) {
    if (kpis.length >= 3) break;
    pushNumeric(column.name, titleCase(column.name), false, "Sum across every row");
  }

  kpis.push({
    id: "data-quality",
    label: "Data Quality",
    value: quality.score,
    formatted: formatPercent(quality.score, 1),
    change: round(quality.score - 100, 1),
    changeLabel: quality.grade,
    hint: `${quality.issues.length} issue${quality.issues.length === 1 ? "" : "s"} detected`,
    spark: quality.dimensions.map((d) => d.score),
  });

  return kpis;
}

/* -------------------------------------------------------------------------- */
/*  Table helpers                                                             */
/* -------------------------------------------------------------------------- */

export interface TableQuery {
  search: string;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
  visibleColumns: string[];
}

export interface TableResult {
  rows: DatasetRow[];
  total: number;
  pageCount: number;
  page: number;
}

/** Search, sort and paginate without ever rendering the whole dataset. */
export function queryTable(dataset: Dataset, query: TableQuery): TableResult {
  const term = query.search.trim().toLowerCase();
  let rows = dataset.rows;

  if (term) {
    rows = rows.filter((row) =>
      query.visibleColumns.some((column) => String(row[column] ?? "").toLowerCase().includes(term)),
    );
  }

  if (query.sortKey) {
    const key = query.sortKey;
    const profile = dataset.columns.find((c) => c.name === key);
    const direction = query.sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === null || av === undefined || av === "") return 1;
      if (bv === null || bv === undefined || bv === "") return -1;
      if (profile?.type === "numeric") {
        return ((toNumber(av) ?? 0) - (toNumber(bv) ?? 0)) * direction;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * direction;
    });
  }

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * query.pageSize;

  return { rows: rows.slice(start, start + query.pageSize), total, pageCount, page };
}
