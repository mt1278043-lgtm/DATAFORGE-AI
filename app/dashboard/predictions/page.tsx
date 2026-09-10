"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, BrainCircuit, Play } from "lucide-react";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { useDataset } from "@/hooks/useDataset";
import { useToast } from "@/hooks/useToast";
import { CHART_COLORS, PREDICTION_TYPES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { sleep } from "@/lib/utils";
import { PredictionError, eligibleTargets, runPrediction } from "@/services/predictionService";
import type { PredictionResult, PredictionType } from "@/types";

const AXIS_STYLE = { fill: "#6C7A9C", fontSize: 11 } as const;
const GRID_STROKE = "rgba(255,255,255,0.06)";

export default function PredictionsPage() {
  const { dataset } = useDataset();
  const toast = useToast();

  const [type, setType] = useState<PredictionType>("forecast");
  const [target, setTarget] = useState("");
  const [feature, setFeature] = useState("");
  const [horizon, setHorizon] = useState("14");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targets = useMemo(() => eligibleTargets(dataset, type), [dataset, type]);
  const numericColumns = useMemo(
    () => dataset.columns.filter((column) => column.type === "numeric").map((column) => column.name),
    [dataset],
  );

  useEffect(() => {
    setTarget(targets[0] ?? "");
    setResult(null);
    setError(null);
  }, [targets]);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      // A short delay so the "training" state is visible - the model itself is instant.
      await sleep(650);
      const prediction = runPrediction(dataset, {
        type,
        target,
        feature: feature || undefined,
        horizon: Number(horizon) || 14,
      });
      setResult(prediction);
      toast.success("Model ready", `${prediction.model}`);
    } catch (caught) {
      const message =
        caught instanceof PredictionError
          ? caught.message
          : "That model could not be trained on this dataset.";
      setError(message);
      setResult(null);
      toast.error("Prediction failed", message);
    } finally {
      setRunning(false);
    }
  };

  if (targets.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Predictions"
          title="Predictive modelling"
          description="Fit a model against your dataset and project what happens next."
        />
        <EmptyState
          icon={<BrainCircuit className="h-5 w-5" />}
          title={`No eligible ${type} targets`}
          description="This dataset has no column suitable for the selected prediction type. Try another type, or load a dataset with numeric and categorical columns."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Predictions"
        title="Predictive modelling"
        description="Regression, classification and time-series forecasting - trained in the browser, labelled honestly as simulated."
        actions={
          <Button icon={<Play className="h-4 w-4" />} loading={running} onClick={() => void run()}>
            Run prediction
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <DatasetPill />
        <Badge tone="warning" dot>
          Demo prediction engine
        </Badge>
      </div>

      <Card highlight>
        <CardHeader
          icon={<BrainCircuit className="h-4 w-4" />}
          title="Model configuration"
          description={PREDICTION_TYPES.find((option) => option.value === type)?.description}
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Prediction type"
              value={type}
              onChange={(value) => setType(value as PredictionType)}
              options={PREDICTION_TYPES.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            <Select
              label="Target variable"
              value={target}
              onChange={setTarget}
              options={targets.map((name) => ({ value: name, label: name }))}
              hint="What the model predicts"
            />
            <Select
              label={type === "forecast" ? "Driver (unused)" : "Feature / driver"}
              value={feature}
              onChange={setFeature}
              disabled={type === "forecast"}
              options={[
                { value: "", label: "Auto-select" },
                ...numericColumns
                  .filter((name) => name !== target)
                  .map((name) => ({ value: name, label: name })),
              ]}
            />
            <Select
              label="Horizon"
              value={horizon}
              onChange={setHorizon}
              disabled={type !== "forecast"}
              options={["7", "14", "30", "60"].map((value) => ({
                value,
                label: `${value} periods`,
              }))}
            />
          </div>
        </CardBody>
      </Card>

      {error ? (
        <Card className="flex items-start gap-3 border-danger/25 p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink">This model could not be trained</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">{error}</p>
          </div>
        </Card>
      ) : null}

      {result ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {result.metrics.map((metric) => (
              <Card key={metric.label} className="p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">{metric.label}</p>
                <p className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-ink">
                  {metric.value}
                </p>
                {metric.hint ? (
                  <p className="mt-1 text-[11.5px] text-ink-faint">{metric.hint}</p>
                ) : null}
              </Card>
            ))}
          </section>

          <Card highlight>
            <CardHeader
              title={
                result.type === "forecast"
                  ? `${result.target} forecast`
                  : result.type === "regression"
                    ? `${result.target} vs. ${result.feature}`
                    : `${result.target} class distribution`
              }
              description={result.model}
              actions={
                <Badge tone="warning" dot>
                  SIMULATED
                </Badge>
              }
            />
            <CardBody className="px-2 sm:px-4">
              <ResponsiveContainer width="100%" height={380}>
                {result.type === "classification" ? (
                  <BarChart data={result.series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_STYLE} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                    <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="actual" name="Support (rows)" radius={[6, 6, 0, 0]} maxBarSize={54}>
                      {result.series.map((entry, index) => (
                        <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : result.type === "regression" ? (
                  <ComposedChart data={result.series} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 6" />
                    <XAxis
                      dataKey="label"
                      name={result.feature}
                      tick={AXIS_STYLE}
                      tickLine={false}
                      axisLine={{ stroke: GRID_STROKE }}
                    />
                    <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={64} />
                    <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "4 4" }} />
                    <Legend
                      formatter={(value: string) => (
                        <span style={{ color: "#96A2C0", fontSize: 12 }}>{value}</span>
                      )}
                    />
                    <Scatter dataKey="actual" name="Actual" fill="#22D3EE" />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Fitted line"
                      stroke="#F472B6"
                      strokeWidth={2.2}
                      dot={false}
                    />
                  </ComposedChart>
                ) : (
                  <AreaChart data={result.series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecast-band" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F472B6" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#F472B6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 6" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={AXIS_STYLE}
                      tickLine={false}
                      axisLine={{ stroke: GRID_STROKE }}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={AXIS_STYLE}
                      tickLine={false}
                      axisLine={false}
                      width={64}
                      tickFormatter={(value: number) => formatNumber(value, { compact: true })}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      formatter={(value: string) => (
                        <span style={{ color: "#96A2C0", fontSize: 12 }}>{value}</span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      name="Upper bound"
                      stroke="none"
                      fill="url(#forecast-band)"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="Actual"
                      stroke="#22D3EE"
                      strokeWidth={2.2}
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      name="Predicted"
                      stroke="#8B5CF6"
                      strokeWidth={2.2}
                      strokeDasharray="6 5"
                      fill="none"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Model narrative" description="Written from the fitted parameters" />
            <CardBody className="space-y-3">
              <p className="text-[14px] leading-relaxed text-ink">{result.narrative}</p>
              {result.equation ? (
                <p className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 font-mono text-[12.5px] text-brand-cyan">
                  {result.equation}
                </p>
              ) : null}
              <p className="text-[12px] text-ink-faint">
                These predictions are produced by a client-side demo engine and are labelled as
                simulated. Point the prediction service at a real ML backend to replace them without
                touching the UI.
              </p>
            </CardBody>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<BrainCircuit className="h-5 w-5" />}
          title="No model trained yet"
          description="Choose a target and press Run prediction. Regression needs two numeric columns, classification needs a categorical target, and forecasting needs a date column."
          action={
            <Button icon={<Play className="h-4 w-4" />} loading={running} onClick={() => void run()}>
              Run prediction
            </Button>
          }
        />
      )}
    </>
  );
}
