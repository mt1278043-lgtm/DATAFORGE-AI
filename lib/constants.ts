import type { ChartType, PredictionType, SupportedFileType } from "@/types";

export const APP_NAME = "DataForge AI";
export const APP_TAGLINE = "Turn Raw Data Into Intelligent Decisions.";
export const APP_DESCRIPTION =
  "Upload your data, uncover hidden patterns, and transform complex datasets into clear, actionable intelligence.";

/** Hard limits keep the browser responsive on large files. */
export const LIMITS = {
  maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
  maxRowsInMemory: 50_000,
  maxRowsForFullScan: 100_000,
  tablePageSizes: [10, 25, 50, 100],
  defaultPageSize: 25,
  maxChartCategories: 40,
  maxChatMessages: 60,
} as const;

export const ACCEPTED_FILE_TYPES: SupportedFileType[] = ["csv", "xls", "xlsx"];

export const ACCEPTED_MIME = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "scatter", label: "Scatter" },
];

export const PREDICTION_TYPES: { value: PredictionType; label: string; description: string }[] = [
  {
    value: "regression",
    label: "Regression",
    description: "Estimate a continuous target from a numeric driver.",
  },
  {
    value: "classification",
    label: "Classification",
    description: "Score the likelihood of each category in a label column.",
  },
  {
    value: "forecast",
    label: "Time Series Forecast",
    description: "Project the next periods from historical movement.",
  },
];

/** Chart palette — cyan → violet → pink, tuned for dark surfaces. */
export const CHART_COLORS = [
  "#22D3EE",
  "#8B5CF6",
  "#F472B6",
  "#38BDF8",
  "#A855F7",
  "#34D399",
  "#FBBF24",
  "#FB7185",
  "#60A5FA",
  "#C084FC",
] as const;

export const COLUMN_TYPE_STYLES: Record<
  string,
  { label: string; className: string; short: string }
> = {
  numeric: {
    label: "Numeric",
    short: "123",
    className: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/25",
  },
  categorical: {
    label: "Categorical",
    short: "Abc",
    className: "text-brand-purple bg-brand-purple/10 border-brand-purple/25",
  },
  date: {
    label: "Date",
    short: "Cal",
    className: "text-brand-pink bg-brand-pink/10 border-brand-pink/25",
  },
  boolean: {
    label: "Boolean",
    short: "T/F",
    className: "text-success bg-success/10 border-success/25",
  },
  empty: {
    label: "Empty",
    short: "∅",
    className: "text-ink-faint bg-white/5 border-white/10",
  },
};

export const SUGGESTED_QUESTIONS = [
  "Summarize my dataset.",
  "What are the most important trends?",
  "Find unusual patterns.",
  "Why did revenue decrease?",
  "Which product performs best?",
  "What should I focus on?",
] as const;

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Analytics", href: "#analytics" },
  { label: "AI Insights", href: "#ai-insights" },
  { label: "Predictions", href: "#predictions" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;
