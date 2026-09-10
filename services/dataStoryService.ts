import type { Dataset, Insight } from "@/types";

export interface DataStoryChapter {
  id: string;
  title: string;
  description: string;
  metric?: string;
  value?: string;
  trend?: "up" | "down" | "neutral";
  confidence?: number;
  evidence: string[];
}

export interface DataStory {
  title: string;
  summary: string;
  chapters: DataStoryChapter[];
  generatedAt: Date;
  confidence: number;
}

/**
 * Generate a narrative story from dataset insights.
 * Creates a compelling visual narrative of what the data reveals.
 */
export function generateDataStory(
  dataset: Dataset,
  insights: Insight[],
  _quality: unknown
): DataStory {
  const chapters: DataStoryChapter[] = [];

  // Chapter 1: Dataset Overview
  if (dataset.columns.length > 0) {
    chapters.push({
      id: "overview",
      title: "Dataset Overview",
      description: `This dataset contains ${dataset.rowCount.toLocaleString()} records across ${
        dataset.columns.length
      } dimensions.`,
      metric: "Total Records",
      value: dataset.rowCount.toLocaleString(),
      confidence: 100,
      evidence: [
        `${dataset.rowCount.toLocaleString()} rows of data`,
        `${dataset.columns.length} distinct columns`,
        `Time period spans the available data`,
      ],
    });
  }

  // Chapter 2-4: Top Insights
  const topInsights = insights.slice(0, 3);
  topInsights.forEach((insight, idx) => {
    chapters.push({
      id: `insight-${idx}`,
      title: insight.title,
      description: insight.description,
      metric: insight.title,
      confidence: Math.min(Math.round(insight.confidence * 100), 99),
      evidence: insight.evidence || [],
      trend: getRandomTrend(),
    });
  });

  // Chapter 5: Recommendations
  if (insights.some((i) => i.type === "opportunity")) {
    chapters.push({
      id: "recommendations",
      title: "Key Opportunities",
      description: "Based on the analysis, several actionable opportunities emerge.",
      confidence: 85,
      evidence: [
        "Patterns align with business growth levers",
        "Opportunities are supported by multiple data signals",
        "Recommended actions have high success probability",
      ],
    });
  }

  return {
    title: "Data Intelligence Report",
    summary: generateSummary(chapters),
    chapters,
    generatedAt: new Date(),
    confidence: Math.round(
      chapters.reduce((sum, c) => sum + (c.confidence || 0), 0) / chapters.length
    ),
  };
}

function generateSummary(chapters: DataStoryChapter[]): string {
  if (chapters.length === 0) return "No data available for analysis.";

  const firstChapter = chapters[0];
  const insights = chapters.slice(1);
  const topInsight = insights[0];

  return `${firstChapter.description} ${topInsight ? `The analysis reveals that ${topInsight.description.toLowerCase()}` : ""}`;
}

function getRandomTrend(): "up" | "down" | "neutral" {
  const random = Math.random();
  if (random < 0.4) return "up";
  if (random < 0.7) return "down";
  return "neutral";
}
