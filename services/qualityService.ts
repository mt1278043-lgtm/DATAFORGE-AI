import { round } from "@/lib/utils";
import type {
  ColumnProfile,
  Dataset,
  QualityDimension,
  QualityGrade,
  QualityIssue,
  QualityReport,
} from "@/types";

const HIGH_CARDINALITY_RATIO = 0.9;

function gradeFor(score: number): QualityGrade {
  if (score >= 92) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 65) return "Fair";
  return "Poor";
}

function issueForColumn(column: ColumnProfile, rowCount: number): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (column.missing > 0) {
    const severity = column.missingRate > 20 ? "critical" : column.missingRate > 5 ? "warning" : "info";
    issues.push({
      id: `missing-${column.name}`,
      kind: "missing",
      column: column.name,
      severity,
      count: column.missing,
      title: `Missing values in "${column.name}"`,
      description: `${column.missing.toLocaleString()} of ${rowCount.toLocaleString()} rows (${column.missingRate}%) have no value.`,
      suggestion:
        column.type === "numeric"
          ? "Impute with the column median to preserve the distribution."
          : "Fill with the most frequent category or an explicit \"Unknown\" label.",
      autoFixable: true,
    });
  }

  if (column.invalid > 0) {
    issues.push({
      id: `invalid-${column.name}`,
      kind: "invalid",
      column: column.name,
      severity: column.invalid / Math.max(rowCount, 1) > 0.05 ? "critical" : "warning",
      count: column.invalid,
      title: `Invalid values in "${column.name}"`,
      description: `${column.invalid.toLocaleString()} cells do not match the detected ${column.type} type.`,
      suggestion: "Coerce the values to the detected type and quarantine anything that fails.",
      autoFixable: true,
    });
  }

  const outliers = column.numeric?.outlierCount ?? 0;
  if (outliers > 0) {
    issues.push({
      id: `outlier-${column.name}`,
      kind: "outlier",
      column: column.name,
      severity: outliers / Math.max(rowCount, 1) > 0.05 ? "warning" : "info",
      count: outliers,
      title: `Potential outliers in "${column.name}"`,
      description: `${outliers.toLocaleString()} values fall outside 1.5x the interquartile range.`,
      suggestion: "Review them before aggregating, or cap them at the P1/P99 boundary.",
      autoFixable: true,
    });
  }

  if (column.unique === 1 && rowCount > 1 && column.missing < rowCount) {
    issues.push({
      id: `constant-${column.name}`,
      kind: "constant",
      column: column.name,
      severity: "info",
      count: rowCount,
      title: `"${column.name}" is constant`,
      description: "Every row shares the same value, so this column carries no signal.",
      suggestion: "Consider dropping it from models and charts.",
      autoFixable: false,
    });
  }

  if (
    column.type === "categorical" &&
    rowCount > 20 &&
    column.unique / rowCount > HIGH_CARDINALITY_RATIO
  ) {
    issues.push({
      id: `cardinality-${column.name}`,
      kind: "high-cardinality",
      column: column.name,
      severity: "info",
      count: column.unique,
      title: `"${column.name}" is nearly unique`,
      description: `${column.unique.toLocaleString()} distinct values across ${rowCount.toLocaleString()} rows - this looks like an identifier.`,
      suggestion: "Exclude it from grouping and categorical charts.",
      autoFixable: false,
    });
  }

  return issues;
}

/**
 * Computes a weighted data-quality score from four dimensions.
 * Every number here is derived from the actual dataset profile.
 */
export function analyzeQuality(dataset: Dataset): QualityReport {
  const { stats, columns, rowCount } = dataset;

  const completeness = stats.totalCells === 0 ? 100 : 100 - stats.missingRate;
  const uniqueness = rowCount === 0 ? 100 : 100 - (stats.duplicateRows / rowCount) * 100;
  const validity =
    stats.totalCells === 0 ? 100 : 100 - (stats.invalidCells / stats.totalCells) * 100;
  const consistency =
    stats.totalCells === 0 ? 100 : 100 - Math.min(100, (stats.outlierCells / stats.totalCells) * 100 * 4);

  const dimensions: QualityDimension[] = [
    {
      key: "completeness",
      label: "Completeness",
      score: round(Math.max(0, completeness), 1),
      detail: `${stats.missingCells.toLocaleString()} missing cells of ${stats.totalCells.toLocaleString()}`,
    },
    {
      key: "uniqueness",
      label: "Uniqueness",
      score: round(Math.max(0, uniqueness), 1),
      detail: `${stats.duplicateRows.toLocaleString()} duplicate rows detected`,
    },
    {
      key: "validity",
      label: "Validity",
      score: round(Math.max(0, validity), 1),
      detail: `${stats.invalidCells.toLocaleString()} cells fail their column type`,
    },
    {
      key: "consistency",
      label: "Consistency",
      score: round(Math.max(0, consistency), 1),
      detail: `${stats.outlierCells.toLocaleString()} statistical outliers found`,
    },
  ];

  const score = round(
    dimensions[0].score * 0.4 +
      dimensions[1].score * 0.25 +
      dimensions[2].score * 0.25 +
      dimensions[3].score * 0.1,
    1,
  );

  const issues = columns
    .flatMap((column) => issueForColumn(column, rowCount))
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.count - a.count);

  if (stats.duplicateRows > 0) {
    issues.unshift({
      id: "duplicate-rows",
      kind: "duplicate",
      column: null,
      severity: stats.duplicateRows / Math.max(rowCount, 1) > 0.02 ? "warning" : "info",
      count: stats.duplicateRows,
      title: "Duplicate rows",
      description: `${stats.duplicateRows.toLocaleString()} rows are exact copies of an earlier row.`,
      suggestion: "Drop duplicates before aggregating so totals are not double counted.",
      autoFixable: true,
    });
  }

  return {
    score,
    grade: gradeFor(score),
    dimensions,
    missingValues: stats.missingCells,
    duplicateRows: stats.duplicateRows,
    invalidValues: stats.invalidCells,
    outliers: stats.outlierCells,
    issues,
    recommendations: buildRecommendations(dataset, issues, score),
  };
}

function severityWeight(severity: QualityIssue["severity"]): number {
  return severity === "critical" ? 3 : severity === "warning" ? 2 : 1;
}

function buildRecommendations(
  dataset: Dataset,
  issues: QualityIssue[],
  score: number,
): string[] {
  const recommendations: string[] = [];
  const worstMissing = [...dataset.columns].sort((a, b) => b.missingRate - a.missingRate)[0];

  if (worstMissing && worstMissing.missingRate > 0) {
    recommendations.push(
      `Impute "${worstMissing.name}" first - it holds the highest share of missing values (${worstMissing.missingRate}%).`,
    );
  }
  if (dataset.stats.duplicateRows > 0) {
    recommendations.push(
      `Remove ${dataset.stats.duplicateRows.toLocaleString()} duplicate rows to avoid inflating totals by ${round(
        (dataset.stats.duplicateRows / Math.max(dataset.rowCount, 1)) * 100,
        1,
      )}%.`,
    );
  }
  if (dataset.stats.outlierCells > 0) {
    recommendations.push(
      "Review flagged outliers before modelling - legitimate spikes should be kept, data-entry errors capped.",
    );
  }
  if (dataset.stats.dateColumns.length === 0) {
    recommendations.push(
      "Add a date column to unlock time-series forecasting and period-over-period trends.",
    );
  }
  if (issues.length === 0) {
    recommendations.push("No structural issues found. This dataset is ready for modelling.");
  }
  if (score < 80) {
    recommendations.push(
      "Run the automatic cleaning pass in Data Cleaning to lift the score above the 80-point reliability threshold.",
    );
  }

  return recommendations.slice(0, 6);
}
