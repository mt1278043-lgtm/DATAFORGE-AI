/**
 * DataForge AI — shared domain types.
 * Every module (parsing, profiling, insights, predictions, reporting)
 * speaks these types so features stay composable.
 */

/* -------------------------------------------------------------------------- */
/*  Dataset primitives                                                        */
/* -------------------------------------------------------------------------- */

export type CellValue = string | number | boolean | null;

export type DatasetRow = Record<string, CellValue>;

export type ColumnType = "numeric" | "categorical" | "date" | "boolean" | "empty";

export type DatasetSource = "demo" | "upload";

export type SupportedFileType = "csv" | "xls" | "xlsx";

export interface NumericSummary {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
  stdDev: number;
  p25: number;
  p75: number;
  outlierCount: number;
  /** Row indices flagged by the 1.5 × IQR rule. */
  outlierRows: number[];
}

export interface CategoryCount {
  value: string;
  count: number;
  share: number;
}

export interface DateSummary {
  min: string;
  max: string;
  spanDays: number;
}

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  /** Number of empty / null / NaN cells. */
  missing: number;
  missingRate: number;
  unique: number;
  /** Cells that do not match the inferred column type. */
  invalid: number;
  samples: string[];
  numeric?: NumericSummary;
  categories?: CategoryCount[];
  date?: DateSummary;
}

export interface DatasetMeta {
  id: string;
  name: string;
  source: DatasetSource;
  fileType: SupportedFileType | "generated";
  sizeBytes: number;
  createdAt: string;
  sheetName?: string;
}

export interface Dataset {
  meta: DatasetMeta;
  columns: ColumnProfile[];
  rows: DatasetRow[];
  rowCount: number;
  columnCount: number;
  /** Aggregate profile computed once at parse time. */
  stats: DatasetStats;
}

export interface DatasetStats {
  totalCells: number;
  missingCells: number;
  missingRate: number;
  duplicateRows: number;
  invalidCells: number;
  outlierCells: number;
  numericColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
}

/* -------------------------------------------------------------------------- */
/*  Data quality                                                              */
/* -------------------------------------------------------------------------- */

export type IssueSeverity = "critical" | "warning" | "info";

export type IssueKind =
  | "missing"
  | "duplicate"
  | "outlier"
  | "invalid"
  | "type-mismatch"
  | "constant"
  | "high-cardinality";

export interface QualityIssue {
  id: string;
  kind: IssueKind;
  column: string | null;
  severity: IssueSeverity;
  count: number;
  title: string;
  description: string;
  suggestion: string;
  autoFixable: boolean;
}

export type QualityGrade = "Excellent" | "Good" | "Fair" | "Poor";

export interface QualityDimension {
  key: "completeness" | "uniqueness" | "validity" | "consistency";
  label: string;
  score: number;
  detail: string;
}

export interface QualityReport {
  score: number;
  grade: QualityGrade;
  dimensions: QualityDimension[];
  missingValues: number;
  duplicateRows: number;
  invalidValues: number;
  outliers: number;
  issues: QualityIssue[];
  recommendations: string[];
}

/* -------------------------------------------------------------------------- */
/*  Cleaning                                                                  */
/* -------------------------------------------------------------------------- */

export type CleaningActionId =
  | "drop-duplicates"
  | "fill-missing-numeric"
  | "fill-missing-categorical"
  | "trim-whitespace"
  | "cap-outliers"
  | "coerce-types"
  | "drop-empty-columns";

export interface CleaningAction {
  id: CleaningActionId;
  label: string;
  description: string;
  affected: number;
  severity: IssueSeverity;
}

export interface CleaningResult {
  dataset: Dataset;
  applied: CleaningActionId[];
  before: CleaningSnapshot;
  after: CleaningSnapshot;
  changedCells: number;
}

export interface CleaningSnapshot {
  rows: number;
  columns: number;
  missing: number;
  duplicates: number;
  outliers: number;
  qualityScore: number;
}

/* -------------------------------------------------------------------------- */
/*  Insights                                                                  */
/* -------------------------------------------------------------------------- */

export type InsightCategory = "finding" | "trend" | "anomaly" | "opportunity" | "recommendation";

export type InsightDirection = "up" | "down" | "flat";

export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  /** Human-formatted headline metric, e.g. "+18.7%". */
  metric?: string;
  direction?: InsightDirection;
  /** 0–1 model/heuristic confidence. */
  confidence: number;
  evidence: string[];
  columns: string[];
}

/* -------------------------------------------------------------------------- */
/*  Charts                                                                    */
/* -------------------------------------------------------------------------- */

export type ChartType = "line" | "bar" | "area" | "pie" | "scatter";

export type Aggregation = "sum" | "avg" | "count" | "min" | "max";

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  xKey: string;
  yKey: string;
  aggregation: Aggregation;
  limit?: number;
}

export interface ChartPoint {
  label: string;
  value: number;
  raw?: number;
  [key: string]: CellValue | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Predictions                                                               */
/* -------------------------------------------------------------------------- */

export type PredictionType = "regression" | "classification" | "forecast";

export interface PredictionRequest {
  type: PredictionType;
  target: string;
  feature?: string;
  horizon?: number;
}

export interface PredictionPoint {
  label: string;
  actual?: number | null;
  predicted?: number | null;
  lower?: number | null;
  upper?: number | null;
}

export interface PredictionMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface PredictionResult {
  type: PredictionType;
  target: string;
  feature?: string;
  model: string;
  simulated: boolean;
  series: PredictionPoint[];
  metrics: PredictionMetric[];
  classes?: { label: string; probability: number; support: number }[];
  narrative: string;
  equation?: string;
}

/* -------------------------------------------------------------------------- */
/*  AI assistant                                                              */
/* -------------------------------------------------------------------------- */

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  mode?: AiMode;
}

export type AiMode = "openai" | "demo";

export interface AiChatResponse {
  message: string;
  mode: AiMode;
  suggestions?: string[];
}

/* -------------------------------------------------------------------------- */
/*  Reports                                                                   */
/* -------------------------------------------------------------------------- */

export interface ReportSection {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
}

export interface GeneratedReport {
  title: string;
  subtitle: string;
  generatedAt: string;
  datasetName: string;
  mode: AiMode;
  kpis: { label: string; value: string; delta?: string }[];
  sections: ReportSection[];
}

/* -------------------------------------------------------------------------- */
/*  UI helpers                                                                */
/* -------------------------------------------------------------------------- */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

export interface KpiDefinition {
  id: string;
  label: string;
  value: number;
  formatted: string;
  change: number;
  changeLabel: string;
  hint: string;
  spark: number[];
}
