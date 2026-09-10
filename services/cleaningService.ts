import { median as medianOf, outlierBounds } from "@/lib/stats";
import { round, uid } from "@/lib/utils";
import { analyzeQuality } from "@/services/qualityService";
import { buildDataset, isMissing, toNumber } from "@/services/profiler";
import type {
  CleaningAction,
  CleaningActionId,
  CleaningResult,
  CleaningSnapshot,
  Dataset,
  DatasetRow,
} from "@/types";

/** Detects which cleaning operations would actually change this dataset. */
export function detectCleaningActions(dataset: Dataset): CleaningAction[] {
  const actions: CleaningAction[] = [];
  const { stats, columns, rows } = dataset;

  if (stats.duplicateRows > 0) {
    actions.push({
      id: "drop-duplicates",
      label: "Remove duplicate rows",
      description: "Deletes rows that are byte-for-byte copies of an earlier row.",
      affected: stats.duplicateRows,
      severity: stats.duplicateRows / Math.max(rows.length, 1) > 0.02 ? "warning" : "info",
    });
  }

  const numericMissing = columns
    .filter((c) => c.type === "numeric")
    .reduce((acc, c) => acc + c.missing, 0);
  if (numericMissing > 0) {
    actions.push({
      id: "fill-missing-numeric",
      label: "Impute numeric gaps with the median",
      description: "Median imputation keeps the distribution stable and resists outliers.",
      affected: numericMissing,
      severity: "warning",
    });
  }

  const categoricalMissing = columns
    .filter((c) => c.type === "categorical" || c.type === "boolean" || c.type === "date")
    .reduce((acc, c) => acc + c.missing, 0);
  if (categoricalMissing > 0) {
    actions.push({
      id: "fill-missing-categorical",
      label: "Fill categorical gaps with the mode",
      description: 'Uses the most frequent value, falling back to "Unknown".',
      affected: categoricalMissing,
      severity: "info",
    });
  }

  const whitespace = countWhitespace(rows, columns.map((c) => c.name));
  if (whitespace > 0) {
    actions.push({
      id: "trim-whitespace",
      label: "Trim stray whitespace",
      description: "Leading and trailing spaces silently split otherwise identical categories.",
      affected: whitespace,
      severity: "info",
    });
  }

  if (stats.outlierCells > 0) {
    actions.push({
      id: "cap-outliers",
      label: "Cap extreme outliers",
      description: "Winsorizes values beyond 1.5x IQR to the nearest fence instead of deleting them.",
      affected: stats.outlierCells,
      severity: "info",
    });
  }

  if (stats.invalidCells > 0) {
    actions.push({
      id: "coerce-types",
      label: "Coerce mistyped cells",
      description: 'Converts values such as "1,240" or "$52.10" into real numbers.',
      affected: stats.invalidCells,
      severity: "warning",
    });
  }

  const emptyColumns = columns.filter((c) => c.type === "empty").length;
  if (emptyColumns > 0) {
    actions.push({
      id: "drop-empty-columns",
      label: "Drop empty columns",
      description: "Columns without a single value add noise to every view.",
      affected: emptyColumns,
      severity: "info",
    });
  }

  return actions;
}

function countWhitespace(rows: DatasetRow[], columns: string[]): number {
  let count = 0;
  const limit = Math.min(rows.length, 5000);
  for (let i = 0; i < limit; i += 1) {
    for (const column of columns) {
      const value = rows[i][column];
      if (typeof value === "string" && value !== value.trim()) count += 1;
    }
  }
  return count;
}

export function snapshotOf(dataset: Dataset): CleaningSnapshot {
  return {
    rows: dataset.rowCount,
    columns: dataset.columnCount,
    missing: dataset.stats.missingCells,
    duplicates: dataset.stats.duplicateRows,
    outliers: dataset.stats.outlierCells,
    qualityScore: analyzeQuality(dataset).score,
  };
}

/**
 * Applies the selected cleaning actions and returns a brand new dataset
 * alongside before/after metrics. The original dataset is never mutated.
 */
export function applyCleaning(dataset: Dataset, actions: CleaningActionId[]): CleaningResult {
  const before = snapshotOf(dataset);
  const selected = new Set(actions);
  let rows: DatasetRow[] = dataset.rows.map((row) => ({ ...row }));
  let columns = dataset.columns.map((c) => c.name);
  let changedCells = 0;

  if (selected.has("drop-empty-columns")) {
    const empties = new Set(dataset.columns.filter((c) => c.type === "empty").map((c) => c.name));
    if (empties.size > 0) {
      columns = columns.filter((name) => !empties.has(name));
      rows = rows.map((row) => {
        const next: DatasetRow = {};
        for (const name of columns) next[name] = row[name] ?? null;
        return next;
      });
      changedCells += empties.size * rows.length;
    }
  }

  if (selected.has("trim-whitespace")) {
    for (const row of rows) {
      for (const name of columns) {
        const value = row[name];
        if (typeof value === "string" && value !== value.trim()) {
          row[name] = value.trim();
          changedCells += 1;
        }
      }
    }
  }

  if (selected.has("coerce-types")) {
    for (const profile of dataset.columns) {
      if (profile.type !== "numeric" || !columns.includes(profile.name)) continue;
      for (const row of rows) {
        const value = row[profile.name];
        if (typeof value === "string") {
          const num = toNumber(value);
          if (num !== null) {
            row[profile.name] = num;
            changedCells += 1;
          }
        }
      }
    }
  }

  if (selected.has("drop-duplicates")) {
    const seen = new Set<string>();
    const deduped: DatasetRow[] = [];
    for (const row of rows) {
      const signature = columns.map((c) => String(row[c] ?? "")).join("");
      if (seen.has(signature)) continue;
      seen.add(signature);
      deduped.push(row);
    }
    changedCells += (rows.length - deduped.length) * columns.length;
    rows = deduped;
  }

  if (selected.has("fill-missing-numeric")) {
    for (const profile of dataset.columns) {
      if (profile.type !== "numeric" || !columns.includes(profile.name)) continue;
      const values = rows
        .map((row) => toNumber(row[profile.name]))
        .filter((v): v is number => v !== null);
      if (values.length === 0) continue;
      const fill = round(medianOf(values), 4);
      for (const row of rows) {
        if (isMissing(row[profile.name])) {
          row[profile.name] = fill;
          changedCells += 1;
        }
      }
    }
  }

  if (selected.has("fill-missing-categorical")) {
    for (const profile of dataset.columns) {
      if (profile.type === "numeric" || profile.type === "empty") continue;
      if (!columns.includes(profile.name)) continue;
      const fill = profile.categories?.[0]?.value ?? profile.samples[0] ?? "Unknown";
      for (const row of rows) {
        if (isMissing(row[profile.name])) {
          row[profile.name] = fill;
          changedCells += 1;
        }
      }
    }
  }

  if (selected.has("cap-outliers")) {
    for (const profile of dataset.columns) {
      if (profile.type !== "numeric" || !columns.includes(profile.name)) continue;
      const values = rows
        .map((row) => toNumber(row[profile.name]))
        .filter((v): v is number => v !== null);
      if (values.length < 8) continue;
      const { lower, upper } = outlierBounds(values);
      for (const row of rows) {
        const value = toNumber(row[profile.name]);
        if (value === null) continue;
        if (value < lower) {
          row[profile.name] = round(lower, 4);
          changedCells += 1;
        } else if (value > upper) {
          row[profile.name] = round(upper, 4);
          changedCells += 1;
        }
      }
    }
  }

  const cleaned = buildDataset(rows, {
    ...dataset.meta,
    id: uid("ds"),
    name: dataset.meta.name.replace(/(\.[a-z]+)?$/i, "") + " (cleaned)",
    createdAt: new Date().toISOString(),
  });

  return {
    dataset: cleaned,
    applied: actions,
    before,
    after: snapshotOf(cleaned),
    changedCells,
  };
}
