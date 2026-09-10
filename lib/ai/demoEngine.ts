import type { DatasetContext } from "@/lib/ai/context";

/**
 * Deterministic analyst that answers questions purely from the computed
 * dataset profile. This is what powers DEMO MODE when no OPENAI_API_KEY is
 * configured - every number it prints comes from the real profile.
 */

type Intent =
  | "summary"
  | "trends"
  | "anomalies"
  | "decline"
  | "best"
  | "focus"
  | "quality"
  | "columns"
  | "correlation"
  | "forecast"
  | "fallback";

const INTENT_PATTERNS: [Intent, RegExp][] = [
  ["summary", /\b(summar\w*|overview|describe|what is (this|my)|tell me about)/i],
  ["trends", /\b(trend|growth|over time|direction|momentum|increas|rising)/i],
  ["anomalies", /\b(anomal|unusual|outlier|strange|spike|weird|odd)/i],
  ["decline", /\b(why|decreas|drop|declin|fell|down|loss|churn)/i],
  ["best", /\b(best|top|strongest|highest|winner|perform)/i],
  ["focus", /\b(focus|priorit|recommend|next step|should i|advice|action)/i],
  ["quality", /\b(quality|missing|duplicate|clean|reliab|complete)/i],
  ["columns", /\b(column|field|schema|structure|data type)/i],
  ["correlation", /\b(correlat|relationship|driver|affect|impact|influenc)/i],
  ["forecast", /\b(forecast|predict|future|next month|projection|expect)/i],
];

function detectIntent(question: string): Intent {
  for (const [intent, pattern] of INTENT_PATTERNS) {
    if (pattern.test(question)) return intent;
  }
  return "fallback";
}

function num(value: number | undefined, fallback = "n/a"): string {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function insightsFor(context: DatasetContext, categories: string[]) {
  return context.insights.filter((i) => categories.includes(i.category));
}

function numericColumns(context: DatasetContext) {
  return context.columns.filter((c) => c.type === "numeric");
}

function summarize(context: DatasetContext): string {
  const numeric = numericColumns(context);
  const categorical = context.columns.filter((c) => c.type === "categorical");
  const dates = context.columns.filter((c) => c.type === "date");
  const headline = numeric.slice(0, 3);

  const lines = [
    `**${context.name}** holds **${num(context.rowCount)} rows** across **${context.columnCount} columns** - ${numeric.length} numeric, ${categorical.length} categorical and ${dates.length} date column${dates.length === 1 ? "" : "s"}.`,
    "",
    "**Headline figures**",
    ...headline.map(
      (c) =>
        `- ${c.name}: total ${num(c.sum)}, average ${num(c.mean)}, range ${num(c.min)} to ${num(c.max)}`,
    ),
  ];

  if (dates[0]?.range) {
    lines.push(`- Coverage: ${dates[0].range[0]} through ${dates[0].range[1]}`);
  }

  lines.push(
    "",
    `**Quality** sits at ${context.qualityScore}% (${context.qualityGrade}) with ${num(context.missingCells)} missing cells, ${num(context.duplicateRows)} duplicate rows and ${num(context.outlierCells)} statistical outliers.`,
  );

  const top = context.insights[0];
  if (top) lines.push("", `**Most notable finding** - ${top.summary}`);

  return lines.join("\n");
}

function trends(context: DatasetContext): string {
  const found = insightsFor(context, ["trend"]);
  if (found.length === 0) {
    const numeric = numericColumns(context).slice(0, 3);
    return [
      "No time-ordered trend could be isolated, most likely because the dataset has no usable date column.",
      "",
      "What the distributions do show:",
      ...numeric.map((c) => `- ${c.name} averages ${num(c.mean)} with a median of ${num(c.median)}${(c.mean ?? 0) > (c.median ?? 0) * 1.2 ? " - a right-skewed distribution pulled up by large values." : "."}`),
      "",
      "Add a date column to unlock period-over-period movement and forecasting.",
    ].join("\n");
  }

  return [
    `I found ${found.length} directional signal${found.length === 1 ? "" : "s"} in this dataset:`,
    "",
    ...found.map((i) => `**${i.title}**${i.metric ? ` (${i.metric})` : ""}\n${i.summary}`),
    "",
    "Each figure is computed by comparing the opening third of the period against the closing third, so short-term noise is smoothed out.",
  ].join("\n\n");
}

function anomalies(context: DatasetContext): string {
  const found = insightsFor(context, ["anomaly"]);
  if (found.length === 0 && context.outlierCells === 0) {
    return "No statistical anomalies stand out. Every numeric column sits inside 1.5x its interquartile range, and no period deviates more than two standard deviations from the mean.";
  }

  const lines = found.map((i) => `**${i.title}**${i.metric ? ` (${i.metric})` : ""}\n${i.summary}`);
  const skewed = numericColumns(context).filter(
    (c) => (c.mean ?? 0) > (c.median ?? 0) * 1.25 && (c.median ?? 0) > 0,
  );

  if (skewed.length > 0) {
    lines.push(
      `**Skewed distributions**\n${skewed
        .map((c) => `${c.name} (mean ${num(c.mean)} vs. median ${num(c.median)})`)
        .join(", ")} - a small number of large values is pulling these averages upward. Report the median alongside the mean.`,
    );
  }
  lines.push(
    `In total, **${num(context.outlierCells)} cells** were flagged by the 1.5x IQR rule. Review them before treating them as errors - genuine spikes are worth investigating, not deleting.`,
  );

  return lines.join("\n\n");
}

function decline(context: DatasetContext): string {
  const downward = context.insights.filter(
    (i) => /decreas|declin|down|fell|erod/i.test(i.summary) || i.metric?.startsWith("-"),
  );

  if (downward.length === 0) {
    return [
      "I could not find a decline in this dataset - the directional signals I detected are flat or positive:",
      "",
      ...context.insights.slice(0, 3).map((i) => `- **${i.title}**: ${i.summary}`),
      "",
      "If you are looking at a specific segment, filter to it in Analytics and ask again.",
    ].join("\n");
  }

  const relationship = insightsFor(context, ["finding"]).find((i) => /relationship|r =/i.test(i.summary));

  return [
    "Here is what the data actually shows about the decline:",
    "",
    ...downward.map((i) => `**${i.title}**${i.metric ? ` (${i.metric})` : ""}\n${i.summary}`),
    relationship ? `\n**Likely driver**\n${relationship.summary}` : "",
    "\nThe honest caveat: these are correlations inside your dataset, not a controlled experiment. Treat the driver above as the strongest hypothesis to test first.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function best(context: DatasetContext): string {
  const opportunity = insightsFor(context, ["opportunity", "recommendation"]);
  const categorical = context.columns.filter((c) => c.top?.length);

  if (opportunity.length === 0 && categorical.length === 0) {
    return "This dataset has no categorical column to rank, so there is no 'best performer' to report. Add a product, region or channel column to compare groups.";
  }

  const lines = opportunity.map((i) => `**${i.title}**${i.metric ? ` (${i.metric})` : ""}\n${i.summary}`);

  for (const column of categorical.slice(0, 2)) {
    const top = column.top!.slice(0, 3);
    lines.push(
      `**Most frequent in ${column.name}**\n${top.map((t) => `${t.value} (${num(t.count)} rows)`).join(", ")}`,
    );
  }

  return lines.join("\n\n");
}

function focus(context: DatasetContext): string {
  const recommendations = insightsFor(context, ["recommendation", "opportunity"]);
  const lines: string[] = ["Ranked by expected impact, this is where I would put attention:", ""];

  let index = 1;
  for (const insight of recommendations) {
    lines.push(`**${index}. ${insight.title}** - ${insight.summary}`);
    index += 1;
  }

  if (context.qualityScore < 95) {
    lines.push(
      `**${index}. Close the quality gap** - the dataset scores ${context.qualityScore}%. Fixing ${num(context.missingCells)} missing cells and ${num(context.duplicateRows)} duplicate rows removes the largest source of reporting error.`,
    );
    index += 1;
  }

  const trend = insightsFor(context, ["trend"])[0];
  if (trend) lines.push(`**${index}. Watch the trend** - ${trend.summary}`);

  return lines.join("\n\n");
}

function quality(context: DatasetContext): string {
  const worst = [...context.columns].sort((a, b) => b.missing - a.missing)[0];
  return [
    `Overall data quality is **${context.qualityScore}% (${context.qualityGrade})**.`,
    "",
    `- Missing cells: **${num(context.missingCells)}**`,
    `- Duplicate rows: **${num(context.duplicateRows)}**`,
    `- Statistical outliers: **${num(context.outlierCells)}**`,
    worst && worst.missing > 0
      ? `- Worst column: **${worst.name}** with ${num(worst.missing)} gaps`
      : "- No single column dominates the missing values",
    "",
    "Open **Data Cleaning** to apply median imputation, drop duplicates and cap outliers in one pass - you will see before/after metrics for every action.",
  ].join("\n");
}

function columns(context: DatasetContext): string {
  return [
    `**${context.name}** has ${context.columnCount} columns:`,
    "",
    ...context.columns.map((c) => {
      const detail =
        c.mean !== undefined
          ? `min ${num(c.min)}, max ${num(c.max)}, mean ${num(c.mean)}`
          : c.top?.length
            ? `${num(c.unique)} distinct, most common "${c.top[0].value}"`
            : c.range
              ? `${c.range[0]} to ${c.range[1]}`
              : `${num(c.unique)} distinct values`;
      return `- **${c.name}** (${c.type}) - ${detail}${c.missing > 0 ? `, ${num(c.missing)} missing` : ""}`;
    }),
  ].join("\n");
}

function correlation(context: DatasetContext): string {
  const relationship = insightsFor(context, ["finding"]).find((i) => /r =/.test(i.summary));
  if (!relationship) {
    return "No strong pairwise relationship (|r| >= 0.45) was found between the numeric columns. The measures in this dataset appear to move largely independently.";
  }
  return [
    relationship.summary,
    "",
    "Correlation is not causation - but this is the pair worth testing first, because it is the strongest linear relationship present in your data.",
    "",
    "Open **Predictions -> Regression** to fit the relationship and see the residuals.",
  ].join("\n");
}

function forecast(context: DatasetContext): string {
  const dateColumn = context.columns.find((c) => c.type === "date");
  if (!dateColumn) {
    return "Forecasting needs a date column, and I could not find one in this dataset. Once a date field is present, the Predictions page will project the next periods with a 95% confidence band.";
  }
  const trend = insightsFor(context, ["trend"])[0];
  return [
    `The dataset spans ${dateColumn.range?.[0]} to ${dateColumn.range?.[1]}, which is enough history to project forward.`,
    trend ? `\n${trend.summary}` : "",
    "\nOpen **Predictions -> Time Series Forecast** to project the next periods. Forecasts are produced by a client-side trend model and are clearly labelled as simulated.",
  ]
    .filter(Boolean)
    .join("\n");
}

function fallback(context: DatasetContext, question: string): string {
  const mentioned = context.columns.filter((c) =>
    question.toLowerCase().includes(c.name.toLowerCase()),
  );

  if (mentioned.length > 0) {
    return [
      `Here is what the profile says about ${mentioned.map((c) => `**${c.name}**`).join(", ")}:`,
      "",
      ...mentioned.map((c) =>
        c.mean !== undefined
          ? `- **${c.name}** (${c.type}): total ${num(c.sum)}, average ${num(c.mean)}, median ${num(c.median)}, ranging ${num(c.min)} to ${num(c.max)}${c.missing ? `, ${num(c.missing)} missing` : ""}`
          : `- **${c.name}** (${c.type}): ${num(c.unique)} distinct values${c.top?.length ? `, most common "${c.top[0].value}" (${num(c.top[0].count)} rows)` : ""}`,
      ),
    ].join("\n");
  }

  return [
    `I work from the computed profile of **${context.name}** (${num(context.rowCount)} rows, ${context.columnCount} columns). I could not map that question to a specific analysis.`,
    "",
    "Try one of these:",
    "- Summarize my dataset.",
    "- What are the most important trends?",
    "- Find unusual patterns.",
    "- Which product performs best?",
    "- What should I focus on?",
    "",
    "Running in demo mode - add an `OPENAI_API_KEY` to `.env.local` for open-ended conversation.",
  ].join("\n");
}

/** Answers a question deterministically from the dataset profile. */
export function answerFromContext(question: string, context: DatasetContext): string {
  switch (detectIntent(question)) {
    case "summary":
      return summarize(context);
    case "trends":
      return trends(context);
    case "anomalies":
      return anomalies(context);
    case "decline":
      return decline(context);
    case "best":
      return best(context);
    case "focus":
      return focus(context);
    case "quality":
      return quality(context);
    case "columns":
      return columns(context);
    case "correlation":
      return correlation(context);
    case "forecast":
      return forecast(context);
    default:
      return fallback(context, question);
  }
}

/** Follow-up suggestions shown as chips under the assistant's answer. */
export function suggestFollowUps(context: DatasetContext): string[] {
  const suggestions = ["What should I focus on?", "Find unusual patterns."];
  if (context.columns.some((c) => c.type === "date")) suggestions.push("What are the most important trends?");
  if (context.qualityScore < 99) suggestions.push("How clean is my data?");
  const categorical = context.columns.find((c) => c.top?.length);
  if (categorical) suggestions.push(`Which ${categorical.name.toLowerCase()} performs best?`);
  return suggestions.slice(0, 4);
}
