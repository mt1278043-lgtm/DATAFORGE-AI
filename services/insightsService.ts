import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { correlation, mean, percentChange, trendSplit, zScores } from "@/lib/stats";
import { round, titleCase, uid } from "@/lib/utils";
import {
  aggregateSeries,
  findColumn,
  primaryCategoryColumn,
  primaryDateColumn,
  primaryMetricColumn,
} from "@/services/analyticsService";
import { toNumber } from "@/services/profiler";
import { analyzeQuality } from "@/services/qualityService";
import type { Dataset, Insight, InsightCategory } from "@/types";

function make(
  category: InsightCategory,
  title: string,
  summary: string,
  options: Partial<Insight> = {},
): Insight {
  return {
    id: options.id ?? uid(category),
    category,
    title,
    summary,
    confidence: options.confidence ?? 0.8,
    evidence: options.evidence ?? [],
    columns: options.columns ?? [],
    metric: options.metric,
    direction: options.direction,
  };
}

function isCurrencyColumn(name: string): boolean {
  return /revenue|sales|amount|spend|cost|price|gmv|income/i.test(name);
}

function formatMetricValue(column: string, value: number): string {
  if (isCurrencyColumn(column)) return formatCurrency(value);
  if (/rate|ratio|percent|conversion|margin/i.test(column)) return formatPercent(value, 2);
  return formatNumber(value, { compact: true });
}

/* -------------------------------------------------------------------------- */
/*  Individual detectors                                                      */
/* -------------------------------------------------------------------------- */

function trendInsight(dataset: Dataset): Insight | null {
  const metric = primaryMetricColumn(dataset);
  if (!metric) return null;
  const dateColumn = primaryDateColumn(dataset);

  const series = dateColumn
    ? aggregateSeries(dataset, {
        xKey: dateColumn,
        yKey: metric,
        aggregation: "sum",
        chartType: "line",
        limit: 60,
      }).map((p) => p.value)
    : dataset.rows.map((r) => toNumber(r[metric]) ?? 0);

  if (series.length < 4) return null;
  const { change } = trendSplit(series);
  const direction = change > 1.5 ? "up" : change < -1.5 ? "down" : "flat";
  const label = titleCase(metric).toUpperCase();

  return make(
    "trend",
    `${label} TREND`,
    direction === "flat"
      ? `${titleCase(metric)} stayed broadly flat across the period, moving ${formatPercent(Math.abs(change), 1)} between the opening and closing thirds.`
      : `${titleCase(metric)} ${direction === "up" ? "increased" : "decreased"} ${formatPercent(Math.abs(change), 1)} over the ${dateColumn ? "selected period" : "recorded rows"}.`,
    {
      metric: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      direction,
      confidence: series.length > 20 ? 0.92 : 0.74,
      columns: dateColumn ? [dateColumn, metric] : [metric],
      evidence: [
        `${series.length} aggregated periods analysed`,
        `Opening third average: ${formatMetricValue(metric, trendSplit(series).first)}`,
        `Closing third average: ${formatMetricValue(metric, trendSplit(series).last)}`,
      ],
    },
  );
}

function topPerformerInsight(dataset: Dataset): Insight | null {
  const metric = primaryMetricColumn(dataset);
  const category = primaryCategoryColumn(dataset);
  if (!metric || !category) return null;

  const series = aggregateSeries(dataset, {
    xKey: category,
    yKey: metric,
    aggregation: "sum",
    chartType: "bar",
    limit: 24,
  });
  if (series.length < 2) return null;

  const total = series.reduce((acc, p) => acc + p.value, 0);
  const top = series[0];
  const runnerUp = series[1];
  const share = total === 0 ? 0 : (top.value / total) * 100;
  const lead = percentChange(runnerUp.value, top.value);

  return make(
    "opportunity",
    "OPPORTUNITY",
    `${top.label} leads ${titleCase(category).toLowerCase()} performance with ${formatMetricValue(metric, top.value)} (${formatPercent(share, 1)} of total), ${formatPercent(Math.abs(lead), 1)} ahead of ${runnerUp.label}.`,
    {
      metric: formatPercent(share, 1),
      direction: "up",
      confidence: 0.88,
      columns: [category, metric],
      evidence: [
        `${series.length} distinct values in "${category}"`,
        `Runner-up: ${runnerUp.label} at ${formatMetricValue(metric, runnerUp.value)}`,
        `Concentration: top value holds ${formatPercent(share, 1)} of ${titleCase(metric).toLowerCase()}`,
      ],
    },
  );
}

function anomalyInsight(dataset: Dataset): Insight | null {
  const metric = primaryMetricColumn(dataset);
  if (!metric) return null;
  const dateColumn = primaryDateColumn(dataset);

  const series = dateColumn
    ? aggregateSeries(dataset, {
        xKey: dateColumn,
        yKey: metric,
        aggregation: "sum",
        chartType: "line",
        limit: 120,
      })
    : [];
  if (series.length < 8) {
    const profile = dataset.columns.find((c) => c.name === metric);
    const outliers = profile?.numeric?.outlierCount ?? 0;
    if (outliers === 0) return null;
    return make(
      "anomaly",
      "ANOMALY DETECTED",
      `${outliers.toLocaleString()} ${titleCase(metric).toLowerCase()} values sit outside 1.5x the interquartile range and are pulling the average away from the median.`,
      {
        metric: outliers.toLocaleString(),
        direction: "up",
        confidence: 0.71,
        columns: [metric],
        evidence: [
          `Mean ${formatMetricValue(metric, profile?.numeric?.mean ?? 0)} vs. median ${formatMetricValue(metric, profile?.numeric?.median ?? 0)}`,
          `Range ${formatMetricValue(metric, profile?.numeric?.min ?? 0)} to ${formatMetricValue(metric, profile?.numeric?.max ?? 0)}`,
        ],
      },
    );
  }

  const values = series.map((p) => p.value);
  const scores = zScores(values);
  let peakIndex = 0;
  for (let i = 1; i < scores.length; i += 1) {
    if (Math.abs(scores[i]) > Math.abs(scores[peakIndex])) peakIndex = i;
  }
  if (Math.abs(scores[peakIndex]) < 2) return null;

  const avg = mean(values);
  const deviation = percentChange(avg, values[peakIndex]);

  return make(
    "anomaly",
    "ANOMALY DETECTED",
    `${series[peakIndex].label} recorded ${formatMetricValue(metric, values[peakIndex])} - ${formatPercent(Math.abs(deviation), 1)} ${deviation > 0 ? "above" : "below"} the period average.`,
    {
      metric: `${scores[peakIndex].toFixed(1)}σ`,
      direction: deviation > 0 ? "up" : "down",
      confidence: 0.85,
      columns: dateColumn ? [dateColumn, metric] : [metric],
      evidence: [
        `Period average: ${formatMetricValue(metric, avg)}`,
        `Z-score ${scores[peakIndex].toFixed(2)} across ${values.length} periods`,
        `${scores.filter((s) => Math.abs(s) > 2).length} periods exceed 2 standard deviations`,
      ],
    },
  );
}

function correlationInsight(dataset: Dataset): Insight | null {
  const numeric = dataset.columns.filter((c) => c.type === "numeric");
  if (numeric.length < 2) return null;

  let best: { a: string; b: string; r: number } | null = null;
  for (let i = 0; i < numeric.length; i += 1) {
    for (let j = i + 1; j < numeric.length; j += 1) {
      const a = numeric[i].name;
      const b = numeric[j].name;
      const pairs = dataset.rows
        .slice(0, 5000)
        .map((row) => [toNumber(row[a]), toNumber(row[b])] as const)
        .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
      if (pairs.length < 12) continue;
      const r = correlation(
        pairs.map((p) => p[0]),
        pairs.map((p) => p[1]),
      );
      if (!best || Math.abs(r) > Math.abs(best.r)) best = { a, b, r };
    }
  }

  if (!best || Math.abs(best.r) < 0.45) return null;
  const strength = Math.abs(best.r) > 0.8 ? "strong" : Math.abs(best.r) > 0.6 ? "clear" : "moderate";

  return make(
    "finding",
    "KEY RELATIONSHIP",
    `${titleCase(best.a)} and ${titleCase(best.b)} show a ${strength} ${best.r > 0 ? "positive" : "negative"} relationship (r = ${best.r.toFixed(2)}). Moving one reliably moves the other.`,
    {
      metric: `r = ${best.r.toFixed(2)}`,
      direction: best.r > 0 ? "up" : "down",
      confidence: Math.min(0.95, Math.abs(best.r)),
      columns: [best.a, best.b],
      evidence: [
        `Pearson correlation across ${Math.min(dataset.rowCount, 5000).toLocaleString()} rows`,
        `${round(best.r ** 2 * 100, 1)}% of the variance in ${titleCase(best.b)} is explained by ${titleCase(best.a)}`,
      ],
    },
  );
}

function retentionInsight(dataset: Dataset): Insight | null {
  const customers = findColumn(dataset, "customers");
  const orders = findColumn(dataset, "orders");
  const dateColumn = primaryDateColumn(dataset);
  if (!customers || !orders || !dateColumn) return null;

  const customerSeries = aggregateSeries(dataset, {
    xKey: dateColumn,
    yKey: customers,
    aggregation: "sum",
    chartType: "line",
    limit: 60,
  });
  const orderSeries = aggregateSeries(dataset, {
    xKey: dateColumn,
    yKey: orders,
    aggregation: "sum",
    chartType: "line",
    limit: 60,
  });
  if (customerSeries.length < 6 || orderSeries.length !== customerSeries.length) return null;

  // Repeat share = orders that did not come from a new customer.
  const repeat = orderSeries.map((point, i) => {
    const o = point.value;
    const c = customerSeries[i].value;
    return o === 0 ? 0 : ((o - c) / o) * 100;
  });
  const { first, last, change } = trendSplit(repeat);
  if (Math.abs(change) < 3) return null;

  return make(
    "trend",
    "CUSTOMER RETENTION",
    `Returning-customer share ${change < 0 ? "decreased" : "increased"} by ${formatPercent(Math.abs(change), 1)}, moving from ${formatPercent(first, 1)} to ${formatPercent(last, 1)} of orders.`,
    {
      metric: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      direction: change > 0 ? "up" : "down",
      confidence: 0.79,
      columns: [customers, orders, dateColumn],
      evidence: [
        `Derived from ${titleCase(orders)} minus ${titleCase(customers)} per period`,
        `${repeat.length} periods compared (first third vs. last third)`,
      ],
    },
  );
}

function efficiencyInsight(dataset: Dataset): Insight | null {
  const spend = findColumn(dataset, "spend");
  const revenue = findColumn(dataset, "revenue");
  const category = primaryCategoryColumn(dataset);
  if (!spend || !revenue || !category) return null;

  const revenueByCategory = aggregateSeries(dataset, {
    xKey: category,
    yKey: revenue,
    aggregation: "sum",
    chartType: "bar",
    limit: 24,
  });
  const spendByCategory = aggregateSeries(dataset, {
    xKey: category,
    yKey: spend,
    aggregation: "sum",
    chartType: "bar",
    limit: 24,
  });
  const spendMap = new Map(spendByCategory.map((p) => [p.label, p.value]));

  const roas = revenueByCategory
    .map((p) => ({ label: p.label, value: (spendMap.get(p.label) ?? 0) > 0 ? p.value / (spendMap.get(p.label) ?? 1) : 0 }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
  if (roas.length < 2) return null;

  const best = roas[0];
  const worst = roas[roas.length - 1];

  return make(
    "recommendation",
    "BUDGET REALLOCATION",
    `${best.label} returns ${best.value.toFixed(2)}x on ${titleCase(spend).toLowerCase()} while ${worst.label} returns ${worst.value.toFixed(2)}x. Shifting budget toward ${best.label} is the highest-leverage move available.`,
    {
      metric: `${best.value.toFixed(2)}x`,
      direction: "up",
      confidence: 0.83,
      columns: [category, spend, revenue],
      evidence: [
        `${roas.length} groups ranked by ${titleCase(revenue)} / ${titleCase(spend)}`,
        `Spread between best and worst: ${(best.value - worst.value).toFixed(2)}x`,
      ],
    },
  );
}

function qualityInsight(dataset: Dataset): Insight | null {
  const quality = analyzeQuality(dataset);
  if (quality.issues.length === 0) return null;
  const worst = quality.issues[0];

  return make(
    "finding",
    "DATA QUALITY",
    `Overall quality scores ${formatPercent(quality.score, 1)} (${quality.grade}). The largest single issue is: ${worst.title.toLowerCase()} affecting ${worst.count.toLocaleString()} ${worst.kind === "duplicate" ? "rows" : "cells"}.`,
    {
      metric: formatPercent(quality.score, 1),
      direction: quality.score >= 90 ? "up" : "down",
      confidence: 0.95,
      columns: worst.column ? [worst.column] : [],
      evidence: quality.dimensions.map((d) => `${d.label}: ${d.score}% - ${d.detail}`),
    },
  );
}

/* -------------------------------------------------------------------------- */
/*  Orchestration                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Runs every detector and returns the insights that produced a real signal.
 * Nothing here is templated text with invented numbers: each detector either
 * finds evidence in the dataset or returns null.
 */
export function generateInsights(dataset: Dataset): Insight[] {
  if (dataset.rowCount === 0) return [];

  const detectors = [
    trendInsight,
    retentionInsight,
    topPerformerInsight,
    anomalyInsight,
    correlationInsight,
    efficiencyInsight,
    qualityInsight,
  ];

  return detectors
    .map((detector) => {
      try {
        return detector(dataset);
      } catch {
        return null;
      }
    })
    .filter((insight): insight is Insight => insight !== null);
}

export function insightsByCategory(insights: Insight[]): Record<InsightCategory, Insight[]> {
  const base: Record<InsightCategory, Insight[]> = {
    finding: [],
    trend: [],
    anomaly: [],
    opportunity: [],
    recommendation: [],
  };
  for (const insight of insights) base[insight.category].push(insight);
  return base;
}
