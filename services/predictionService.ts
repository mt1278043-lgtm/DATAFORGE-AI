import { formatNumber, formatPercent } from "@/lib/format";
import { linearRegression, mean, movingAverage, stdDev, trendSplit } from "@/lib/stats";
import { round, titleCase } from "@/lib/utils";
import { aggregateSeries, primaryDateColumn } from "@/services/analyticsService";
import { toNumber } from "@/services/profiler";
import type {
  Dataset,
  PredictionPoint,
  PredictionRequest,
  PredictionResult,
} from "@/types";

export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PredictionError";
  }
}

/* -------------------------------------------------------------------------- */
/*  Regression                                                                */
/* -------------------------------------------------------------------------- */

function runRegression(dataset: Dataset, target: string, feature?: string): PredictionResult {
  const driver =
    feature ??
    dataset.columns.find((c) => c.type === "numeric" && c.name !== target)?.name ??
    null;

  if (!driver) {
    throw new PredictionError("Regression needs a second numeric column to use as the driver.");
  }

  const pairs = dataset.rows
    .map((row) => [toNumber(row[driver]), toNumber(row[target])] as const)
    .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null)
    .slice(0, 5000);

  if (pairs.length < 8) {
    throw new PredictionError("Not enough complete rows to fit a regression model.");
  }

  const xs = pairs.map((p) => p[0]);
  const ys = pairs.map((p) => p[1]);
  const fit = linearRegression(xs, ys);

  const residuals = pairs.map(([x, y]) => y - (fit.slope * x + fit.intercept));
  const rmse = Math.sqrt(mean(residuals.map((r) => r * r)));
  const mae = mean(residuals.map((r) => Math.abs(r)));

  const sorted = [...pairs].sort((a, b) => a[0] - b[0]);
  const step = Math.max(1, Math.floor(sorted.length / 60));
  const series: PredictionPoint[] = [];
  for (let i = 0; i < sorted.length; i += step) {
    const [x, y] = sorted[i];
    const predicted = fit.slope * x + fit.intercept;
    series.push({
      label: formatNumber(round(x, 2)),
      actual: round(y, 2),
      predicted: round(predicted, 2),
      lower: round(predicted - rmse, 2),
      upper: round(predicted + rmse, 2),
    });
  }

  return {
    type: "regression",
    target,
    feature: driver,
    model: "Ordinary least squares (client-side)",
    simulated: true,
    series,
    equation: `${titleCase(target)} = ${fit.slope.toFixed(4)} x ${titleCase(driver)} ${
      fit.intercept >= 0 ? "+" : "-"
    } ${Math.abs(fit.intercept).toFixed(2)}`,
    metrics: [
      { label: "R squared", value: fit.r2.toFixed(3), hint: "Share of variance explained" },
      { label: "RMSE", value: formatNumber(round(rmse, 2)), hint: "Root mean squared error" },
      { label: "MAE", value: formatNumber(round(mae, 2)), hint: "Mean absolute error" },
      { label: "Samples", value: pairs.length.toLocaleString(), hint: "Complete rows used" },
    ],
    narrative: `Each additional unit of ${titleCase(driver)} is associated with ${
      fit.slope >= 0 ? "an increase" : "a decrease"
    } of ${formatNumber(round(Math.abs(fit.slope), 4))} in ${titleCase(target)}. The model explains ${formatPercent(
      fit.r2 * 100,
      1,
    )} of the observed variance across ${pairs.length.toLocaleString()} rows.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Classification                                                            */
/* -------------------------------------------------------------------------- */

function runClassification(dataset: Dataset, target: string, feature?: string): PredictionResult {
  const profile = dataset.columns.find((c) => c.name === target);
  if (!profile || (profile.type !== "categorical" && profile.type !== "boolean")) {
    throw new PredictionError("Classification needs a categorical target column.");
  }

  const counts = new Map<string, number>();
  for (const row of dataset.rows) {
    const value = row[target];
    if (value === null || value === undefined || value === "") continue;
    const key = String(value).trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size < 2) {
    throw new PredictionError("The selected target has fewer than two classes.");
  }

  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const driver =
    feature ?? dataset.columns.find((c) => c.type === "numeric")?.name ?? null;

  // Class-conditional means over the driver give a simple, honest signal.
  const conditional = new Map<string, number[]>();
  if (driver) {
    for (const row of dataset.rows) {
      const label = row[target];
      const value = toNumber(row[driver]);
      if (label === null || label === undefined || value === null) continue;
      const key = String(label).trim();
      const bucket = conditional.get(key);
      if (bucket) bucket.push(value);
      else conditional.set(key, [value]);
    }
  }

  const classes = Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      support: count,
      probability: round((count / total) * 100, 2),
    }))
    .sort((a, b) => b.probability - a.probability);

  const series: PredictionPoint[] = classes.slice(0, 12).map((c) => ({
    label: c.label,
    actual: c.support,
    predicted: driver ? round(mean(conditional.get(c.label) ?? [0]), 2) : c.support,
  }));

  const baseline = classes[0];
  const entropy = -classes.reduce((acc, c) => {
    const p = c.probability / 100;
    return acc + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);

  return {
    type: "classification",
    target,
    feature: driver ?? undefined,
    model: "Class-prior estimator with conditional means (client-side)",
    simulated: true,
    series,
    classes,
    metrics: [
      { label: "Classes", value: String(classes.length), hint: "Distinct labels" },
      {
        label: "Majority baseline",
        value: formatPercent(baseline.probability, 1),
        hint: `Always predicting "${baseline.label}"`,
      },
      { label: "Entropy", value: entropy.toFixed(2), hint: "Bits - higher means more balanced" },
      { label: "Samples", value: total.toLocaleString(), hint: "Labelled rows" },
    ],
    narrative: `"${baseline.label}" is the most likely class at ${formatPercent(
      baseline.probability,
      1,
    )} of ${total.toLocaleString()} labelled rows.${
      driver
        ? ` Ranked by average ${titleCase(driver)}, the strongest class is "${
            [...series].sort((a, b) => (b.predicted ?? 0) - (a.predicted ?? 0))[0]?.label ?? baseline.label
          }".`
        : ""
    }`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Time series forecast                                                      */
/* -------------------------------------------------------------------------- */

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return `t+${days}`;
  return new Date(date.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

function runForecast(dataset: Dataset, target: string, horizon: number): PredictionResult {
  const dateColumn = primaryDateColumn(dataset);
  if (!dateColumn) {
    throw new PredictionError("Forecasting needs a date column in the dataset.");
  }

  const history = aggregateSeries(dataset, {
    xKey: dateColumn,
    yKey: target,
    aggregation: "sum",
    chartType: "line",
    limit: 180,
  });

  if (history.length < 8) {
    throw new PredictionError("Not enough historical periods to build a forecast.");
  }

  const values = history.map((p) => p.value);
  const xs = values.map((_, i) => i);
  const fit = linearRegression(xs, values);
  const smoothed = movingAverage(values, Math.min(7, Math.floor(values.length / 4)));
  const residuals = values.map((v, i) => v - smoothed[i]);
  const noise = stdDev(residuals);

  const stepDays = Math.max(
    1,
    Math.round(
      (new Date(history[history.length - 1].label).getTime() - new Date(history[0].label).getTime()) /
        86_400_000 /
        Math.max(1, history.length - 1),
    ),
  );

  const series: PredictionPoint[] = history.map((point, i) => ({
    label: point.label,
    actual: point.value,
    predicted: round(fit.slope * i + fit.intercept, 2),
  }));

  const lastLabel = history[history.length - 1].label;
  for (let h = 1; h <= horizon; h += 1) {
    const index = values.length - 1 + h;
    const predicted = fit.slope * index + fit.intercept;
    // Uncertainty widens with the square root of the horizon.
    const band = noise * 1.96 * Math.sqrt(h);
    series.push({
      label: addDays(lastLabel, stepDays * h),
      actual: null,
      predicted: round(predicted, 2),
      lower: round(Math.max(0, predicted - band), 2),
      upper: round(predicted + band, 2),
    });
  }

  const { change } = trendSplit(values);
  const projectedTotal = series
    .slice(values.length)
    .reduce((acc, p) => acc + (p.predicted ?? 0), 0);

  return {
    type: "forecast",
    target,
    model: "Linear trend with residual volatility bands (client-side)",
    simulated: true,
    series,
    metrics: [
      { label: "Trend", value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`, hint: "First vs. last third" },
      { label: "R squared", value: fit.r2.toFixed(3), hint: "Trend fit quality" },
      { label: "Horizon", value: `${horizon} periods`, hint: `${stepDays}-day steps` },
      {
        label: "Projected total",
        value: formatNumber(round(projectedTotal, 0), { compact: true }),
        hint: "Sum of the forecast window",
      },
    ],
    narrative: `Based on ${values.length} historical periods, ${titleCase(target)} is trending ${
      fit.slope >= 0 ? "upward" : "downward"
    } at roughly ${formatNumber(round(Math.abs(fit.slope), 2))} per period. The next ${horizon} periods project a total of ${formatNumber(
      round(projectedTotal, 0),
      { compact: true },
    )}, with a 95% band of +/- ${formatNumber(round(noise * 1.96, 2))} widening across the horizon.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Entry point                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Runs a demo-grade prediction entirely in the browser.
 * Results are always labelled `simulated: true` - swap this service for a
 * real ML backend without touching any UI component.
 */
export function runPrediction(dataset: Dataset, request: PredictionRequest): PredictionResult {
  if (dataset.rowCount === 0) throw new PredictionError("Load a dataset first.");
  if (!request.target) throw new PredictionError("Choose a target variable.");

  switch (request.type) {
    case "regression":
      return runRegression(dataset, request.target, request.feature);
    case "classification":
      return runClassification(dataset, request.target, request.feature);
    case "forecast":
      return runForecast(dataset, request.target, request.horizon ?? 14);
    default:
      throw new PredictionError("Unsupported prediction type.");
  }
}

/** Which columns make sense as a target for each prediction type. */
export function eligibleTargets(dataset: Dataset, type: PredictionRequest["type"]): string[] {
  if (type === "classification") {
    return dataset.columns
      .filter((c) => (c.type === "categorical" || c.type === "boolean") && c.unique > 1 && c.unique <= 40)
      .map((c) => c.name);
  }
  return dataset.columns.filter((c) => c.type === "numeric").map((c) => c.name);
}
