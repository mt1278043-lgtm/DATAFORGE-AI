import { formatDate, formatPercent } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { deriveKpis, primaryDateColumn, primaryMetricColumn } from "@/services/analyticsService";
import { generateInsights } from "@/services/insightsService";
import { PredictionError, runPrediction } from "@/services/predictionService";
import { analyzeQuality } from "@/services/qualityService";
import type { AiMode, Dataset, GeneratedReport, ReportSection } from "@/types";

/**
 * Assembles an executive-ready report from the dataset.
 * Every figure is recomputed from the data at generation time.
 */
export function generateReport(dataset: Dataset, mode: AiMode = "demo"): GeneratedReport {
  const quality = analyzeQuality(dataset);
  const insights = generateInsights(dataset);
  const kpis = deriveKpis(dataset);
  const dateColumn = primaryDateColumn(dataset);
  const metric = primaryMetricColumn(dataset);

  const sections: ReportSection[] = [];

  /* Executive summary ----------------------------------------------------- */
  const trend = insights.find((i) => i.category === "trend");
  const opportunity = insights.find((i) => i.category === "opportunity");

  sections.push({
    id: "executive-summary",
    title: "Executive Summary",
    body: [
      `This report covers ${dataset.rowCount.toLocaleString()} records across ${dataset.columnCount} fields from ${dataset.meta.name}${
        dateColumn
          ? `, spanning ${dataset.columns.find((c) => c.name === dateColumn)?.date?.min ?? "the start"} to ${
              dataset.columns.find((c) => c.name === dateColumn)?.date?.max ?? "the end"
            }`
          : ""
      }.`,
      trend ? trend.summary : "No directional trend could be isolated from the available fields.",
      opportunity
        ? opportunity.summary
        : "No single segment dominates performance in the current dataset.",
      `Underlying data quality is ${formatPercent(quality.score, 1)} (${quality.grade}), which ${
        quality.score >= 90
          ? "is high enough to act on these findings directly."
          : "should be improved before these findings drive irreversible decisions."
      }`,
    ].join(" "),
  });

  /* Dataset overview ------------------------------------------------------ */
  sections.push({
    id: "dataset-overview",
    title: "Dataset Overview",
    body: `The dataset contains ${dataset.stats.numericColumns.length} numeric, ${dataset.stats.categoricalColumns.length} categorical and ${dataset.stats.dateColumns.length} date field(s).`,
    bullets: [
      `Rows analysed: ${dataset.rowCount.toLocaleString()}`,
      `Columns analysed: ${dataset.columnCount}`,
      `Missing cells: ${dataset.stats.missingCells.toLocaleString()} (${formatPercent(dataset.stats.missingRate, 2)} of all cells)`,
      `Duplicate rows: ${dataset.stats.duplicateRows.toLocaleString()}`,
      `Statistical outliers: ${dataset.stats.outlierCells.toLocaleString()}`,
      `Source: ${dataset.meta.source === "demo" ? "Built-in demo dataset" : `Uploaded ${String(dataset.meta.fileType).toUpperCase()} file`}`,
    ],
  });

  /* Key metrics ----------------------------------------------------------- */
  sections.push({
    id: "key-metrics",
    title: "Key Metrics",
    body: "Headline aggregates computed across every row in the dataset.",
    bullets: kpis.map(
      (kpi) =>
        `${kpi.label}: ${kpi.formatted}${
          kpi.id === "data-quality" ? ` (${kpi.changeLabel})` : ` (${kpi.change >= 0 ? "+" : ""}${kpi.change}% ${kpi.changeLabel})`
        }`,
    ),
  });

  /* Trends ---------------------------------------------------------------- */
  const trends = insights.filter((i) => i.category === "trend");
  sections.push({
    id: "trends",
    title: "Important Trends",
    body:
      trends.length > 0
        ? "Directional movement was measured by comparing the opening third of the period against the closing third."
        : "No time-ordered movement could be measured from the available fields.",
    bullets: trends.map((t) => `${titleCase(t.title.toLowerCase())}: ${t.summary}`),
  });

  /* Anomalies ------------------------------------------------------------- */
  const anomalies = insights.filter((i) => i.category === "anomaly");
  sections.push({
    id: "anomalies",
    title: "Anomalies",
    body:
      anomalies.length > 0
        ? "The following observations deviate materially from the rest of the dataset."
        : `No period deviates by more than two standard deviations. ${dataset.stats.outlierCells.toLocaleString()} individual cells were flagged by the interquartile rule.`,
    bullets: anomalies.map((a) => a.summary),
  });

  /* AI insights ----------------------------------------------------------- */
  sections.push({
    id: "ai-insights",
    title: "AI Insights",
    body: `${insights.length} signal${insights.length === 1 ? "" : "s"} were detected by the analysis engine${
      mode === "openai" ? ", enriched with an OpenAI narrative." : " running in local demo mode."
    }`,
    bullets: insights.map((i) => `${i.title}${i.metric ? ` (${i.metric})` : ""} - ${i.summary}`),
  });

  /* Recommendations ------------------------------------------------------- */
  sections.push({
    id: "recommendations",
    title: "Recommendations",
    body: "Ordered by expected impact on decision quality.",
    bullets: [
      ...insights.filter((i) => i.category === "recommendation").map((i) => i.summary),
      ...quality.recommendations,
    ].slice(0, 7),
  });

  /* Prediction summary ---------------------------------------------------- */
  let predictionBody = "No forecast was produced for this report.";
  const predictionBullets: string[] = [];

  if (metric) {
    try {
      const prediction = runPrediction(dataset, {
        type: dateColumn ? "forecast" : "regression",
        target: metric,
        horizon: 14,
      });
      predictionBody = `${prediction.narrative} Model: ${prediction.model}.`;
      predictionBullets.push(
        ...prediction.metrics.map((m) => `${m.label}: ${m.value}${m.hint ? ` - ${m.hint}` : ""}`),
      );
      predictionBullets.push("These projections are simulated and produced client-side.");
    } catch (error) {
      predictionBody =
        error instanceof PredictionError
          ? `A forecast could not be produced: ${error.message}`
          : "A forecast could not be produced for this dataset.";
    }
  }

  sections.push({
    id: "prediction-summary",
    title: "Prediction Summary",
    body: predictionBody,
    bullets: predictionBullets,
  });

  return {
    title: `${dataset.meta.name.replace(/\.[a-z]+$/i, "")} - Intelligence Report`,
    subtitle: `${dataset.rowCount.toLocaleString()} records | ${dataset.columnCount} fields | Quality ${formatPercent(quality.score, 1)}`,
    generatedAt: formatDate(new Date(), true),
    datasetName: dataset.meta.name,
    mode,
    kpis: kpis.map((kpi) => ({
      label: kpi.label,
      value: kpi.formatted,
      delta: kpi.id === "data-quality" ? kpi.changeLabel : `${kpi.change >= 0 ? "+" : ""}${kpi.change}%`,
    })),
    sections,
  };
}

/** Renders the report as Markdown for export. */
export function reportToMarkdown(report: GeneratedReport): string {
  const lines: string[] = [
    `# ${report.title}`,
    "",
    `_${report.subtitle}_`,
    "",
    `Generated ${report.generatedAt} by DataForge AI (${report.mode === "openai" ? "OpenAI engine" : "demo engine"}).`,
    "",
    "## Headline KPIs",
    "",
    "| Metric | Value | Change |",
    "| --- | --- | --- |",
    ...report.kpis.map((k) => `| ${k.label} | ${k.value} | ${k.delta ?? "-"} |`),
    "",
  ];

  for (const section of report.sections) {
    lines.push(`## ${section.title}`, "", section.body, "");
    if (section.bullets?.length) {
      lines.push(...section.bullets.map((b) => `- ${b}`), "");
    }
  }

  lines.push("---", "", "Figures are computed directly from the source dataset. Predictions are simulated.");
  return lines.join("\n");
}

/** Renders a standalone, print-ready HTML export. */
export function reportToHtml(report: GeneratedReport): string {
  const kpiCards = report.kpis
    .map(
      (kpi) => `<div class="kpi"><span>${escapeHtml(kpi.label)}</span><strong>${escapeHtml(
        kpi.value,
      )}</strong><em>${escapeHtml(kpi.delta ?? "")}</em></div>`,
    )
    .join("");

  const sections = report.sections
    .map(
      (section) => `<section>
      <h2>${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.body)}</p>
      ${
        section.bullets?.length
          ? `<ul>${section.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
          : ""
      }
    </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(report.title)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; padding:48px 32px; background:#05070D; color:#EAF0FF;
         font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; line-height:1.65; }
  .wrap { max-width: 880px; margin: 0 auto; }
  h1 { font-size: 2rem; margin:0 0 8px; background:linear-gradient(100deg,#22D3EE,#8B5CF6,#F472B6);
       -webkit-background-clip:text; background-clip:text; color:transparent; }
  .sub { color:#96A2C0; margin:0 0 4px; }
  .meta { color:#616E90; font-size:.8rem; margin-bottom:32px; }
  .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin-bottom:36px; }
  .kpi { border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:16px; background:rgba(255,255,255,.03); }
  .kpi span { display:block; font-size:.7rem; letter-spacing:.16em; text-transform:uppercase; color:#616E90; }
  .kpi strong { display:block; font-size:1.5rem; margin:6px 0 2px; }
  .kpi em { font-style:normal; font-size:.75rem; color:#22D3EE; }
  section { border-top:1px solid rgba(255,255,255,.08); padding:24px 0; }
  h2 { font-size:1.1rem; letter-spacing:.02em; margin:0 0 10px; }
  p { margin:0 0 12px; color:#C3CCE4; }
  ul { margin:0; padding-left:20px; color:#96A2C0; }
  li { margin-bottom:6px; }
  footer { margin-top:32px; color:#616E90; font-size:.75rem; }
  @media print { body { background:#fff; color:#111; } h1 { color:#111; -webkit-text-fill-color:#111; }
    .kpi, section { border-color:#ddd; } p,ul { color:#333; } }
</style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(report.title)}</h1>
    <p class="sub">${escapeHtml(report.subtitle)}</p>
    <p class="meta">Generated ${escapeHtml(report.generatedAt)} by DataForge AI</p>
    <div class="kpis">${kpiCards}</div>
    ${sections}
    <footer>Figures are computed directly from the source dataset. Predictions are simulated.</footer>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
