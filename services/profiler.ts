import {
  median as medianOf,
  mean as meanOf,
  outlierBounds,
  quantileSorted,
  stdDev,
  sum as sumOf,
} from "@/lib/stats";
import { round } from "@/lib/utils";
import type {
  CellValue,
  CategoryCount,
  ColumnProfile,
  ColumnType,
  Dataset,
  DatasetMeta,
  DatasetRow,
  DatasetStats,
  NumericSummary,
} from "@/types";

const MISSING_TOKENS = new Set([
  "",
  "na",
  "n/a",
  "null",
  "nil",
  "none",
  "nan",
  "-",
  "--",
  "undefined",
  "?",
]);

const BOOLEAN_TRUE = new Set(["true", "yes", "y", "1"]);
const BOOLEAN_FALSE = new Set(["false", "no", "n", "0"]);

const DATE_PATTERNS = [
  /^\d{4}-\d{1,2}-\d{1,2}([T ]\d{1,2}:\d{2}(:\d{2})?)?/,
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  /^\d{1,2}-[A-Za-z]{3,9}-\d{2,4}$/,
  /^[A-Za-z]{3,9} \d{1,2},? \d{4}$/,
];

/** True when the raw cell should be treated as missing. */
export function isMissing(value: CellValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "number") return Number.isNaN(value);
  if (typeof value === "boolean") return false;
  return MISSING_TOKENS.has(String(value).trim().toLowerCase());
}

/** Parse a cell into a number when it plausibly is one ("1,240", "$52.10", "12%"). */
export function toNumber(value: CellValue): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean" || value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (raw === "") return null;
  const cleaned = raw.replace(/[$€£¥,\s]/g, "").replace(/%$/, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  if (!/^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function toDate(value: CellValue): Date | null {
  if (value === null || value === undefined || typeof value === "boolean") return null;
  const raw = String(value).trim();
  if (raw.length < 6) return null;
  if (!DATE_PATTERNS.some((re) => re.test(raw))) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toBoolean(value: CellValue): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return null;
  const raw = String(value).trim().toLowerCase();
  if (BOOLEAN_TRUE.has(raw)) return true;
  if (BOOLEAN_FALSE.has(raw)) return false;
  return null;
}

/**
 * Infers a column type from its present values using a majority vote.
 * Dates win over numbers so `2024-01-01` is never treated as arithmetic.
 */
export function inferColumnType(values: CellValue[]): ColumnType {
  const present = values.filter((v) => !isMissing(v));
  if (present.length === 0) return "empty";

  let numeric = 0;
  let date = 0;
  let boolean = 0;

  const sample = present.length > 2000 ? present.slice(0, 2000) : present;
  for (const value of sample) {
    if (toDate(value) !== null) {
      date += 1;
      continue;
    }
    if (toBoolean(value) !== null && typeof value !== "number") {
      boolean += 1;
      continue;
    }
    if (toNumber(value) !== null) numeric += 1;
  }

  const total = sample.length;
  if (date / total >= 0.7) return "date";
  if (boolean / total >= 0.9) return "boolean";
  if (numeric / total >= 0.75) return "numeric";
  return "categorical";
}

function summarizeNumeric(values: number[], rowIndices: number[]): NumericSummary {
  const sorted = [...values].sort((a, b) => a - b);
  const { lower, upper, p25, p75 } = outlierBounds(values);
  const outlierRows: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] < lower || values[i] > upper) outlierRows.push(rowIndices[i]);
  }
  return {
    min: round(sorted[0] ?? 0, 4),
    max: round(sorted[sorted.length - 1] ?? 0, 4),
    mean: round(meanOf(values), 4),
    median: round(medianOf(values), 4),
    sum: round(sumOf(values), 4),
    stdDev: round(stdDev(values), 4),
    p25: round(p25, 4),
    p75: round(quantileSorted(sorted, 0.75) || p75, 4),
    outlierCount: outlierRows.length,
    outlierRows: outlierRows.slice(0, 500),
  };
}

function summarizeCategories(values: string[], limit = 12): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const total = values.length || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count, share: round((count / total) * 100, 2) }));
}

/** Builds the full profile for one column. */
export function profileColumn(name: string, values: CellValue[]): ColumnProfile {
  const type = inferColumnType(values);
  const uniqueValues = new Set<string>();
  const samples: string[] = [];

  let missing = 0;
  let invalid = 0;

  const numericValues: number[] = [];
  const numericRows: number[] = [];
  const categoryValues: string[] = [];
  const dateValues: number[] = [];

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (isMissing(value)) {
      missing += 1;
      continue;
    }
    const asString = String(value).trim();
    if (uniqueValues.size < 100_000) uniqueValues.add(asString);
    if (samples.length < 5) samples.push(asString);

    switch (type) {
      case "numeric": {
        const num = toNumber(value);
        if (num === null) invalid += 1;
        else {
          numericValues.push(num);
          numericRows.push(i);
        }
        break;
      }
      case "date": {
        const date = toDate(value);
        if (date === null) invalid += 1;
        else dateValues.push(date.getTime());
        break;
      }
      case "boolean": {
        if (toBoolean(value) === null) invalid += 1;
        break;
      }
      default:
        categoryValues.push(asString);
    }
  }

  const total = values.length || 1;
  const profile: ColumnProfile = {
    name,
    type,
    missing,
    missingRate: round((missing / total) * 100, 2),
    unique: uniqueValues.size,
    invalid,
    samples,
  };

  if (type === "numeric" && numericValues.length > 0) {
    profile.numeric = summarizeNumeric(numericValues, numericRows);
  }
  if (type === "categorical" || type === "boolean") {
    const source =
      type === "boolean" ? values.filter((v) => !isMissing(v)).map(String) : categoryValues;
    profile.categories = summarizeCategories(source);
  }
  if (type === "date" && dateValues.length > 0) {
    const min = Math.min(...dateValues);
    const max = Math.max(...dateValues);
    profile.date = {
      min: new Date(min).toISOString().slice(0, 10),
      max: new Date(max).toISOString().slice(0, 10),
      spanDays: Math.max(0, Math.round((max - min) / 86_400_000)),
    };
  }

  return profile;
}

/** Counts exact duplicate rows using a serialized signature. */
export function countDuplicateRows(rows: DatasetRow[], columns: string[]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  for (const row of rows) {
    const signature = columns.map((c) => String(row[c] ?? "")).join("");
    if (seen.has(signature)) duplicates += 1;
    else seen.add(signature);
  }
  return duplicates;
}

export function buildStats(columns: ColumnProfile[], rows: DatasetRow[]): DatasetStats {
  const totalCells = rows.length * (columns.length || 1);
  const missingCells = columns.reduce((acc, c) => acc + c.missing, 0);
  const invalidCells = columns.reduce((acc, c) => acc + c.invalid, 0);
  const outlierCells = columns.reduce((acc, c) => acc + (c.numeric?.outlierCount ?? 0), 0);

  return {
    totalCells,
    missingCells,
    missingRate: totalCells === 0 ? 0 : round((missingCells / totalCells) * 100, 2),
    duplicateRows: countDuplicateRows(
      rows,
      columns.map((c) => c.name),
    ),
    invalidCells,
    outlierCells,
    numericColumns: columns.filter((c) => c.type === "numeric").map((c) => c.name),
    categoricalColumns: columns
      .filter((c) => c.type === "categorical" || c.type === "boolean")
      .map((c) => c.name),
    dateColumns: columns.filter((c) => c.type === "date").map((c) => c.name),
  };
}

/**
 * Turns raw rows into a fully profiled Dataset.
 * All statistics here are computed from the real values - nothing is faked.
 */
export function buildDataset(rows: DatasetRow[], meta: DatasetMeta): Dataset {
  const columnNames = new Set<string>();
  for (const row of rows.slice(0, 200)) {
    for (const key of Object.keys(row)) columnNames.add(key);
  }
  const columns = Array.from(columnNames).map((name) =>
    profileColumn(
      name,
      rows.map((row) => row[name] ?? null),
    ),
  );

  return {
    meta,
    columns,
    rows,
    rowCount: rows.length,
    columnCount: columns.length,
    stats: buildStats(columns, rows),
  };
}
