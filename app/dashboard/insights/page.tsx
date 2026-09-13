"use client";

import { useMemo, useState } from "react";

import { InsightCard } from "@/components/dashboard/InsightCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { useDataset } from "@/hooks/useDataset";
import type { InsightCategory } from "@/types";

const CATEGORY_TABS: { value: InsightCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "finding", label: "Key Findings" },
  { value: "trend", label: "Trends" },
  { value: "anomaly", label: "Anomalies" },
  { value: "opportunity", label: "Opportunities" },
  { value: "recommendation", label: "Recommendations" },
];

export default function InsightsPage() {
  const { dataset, insights } = useDataset();

  const [tab, setTab] = useState<string>("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const insight of insights) map.set(insight.category, (map.get(insight.category) ?? 0) + 1);
    return map;
  }, [insights]);

  const filtered = tab === "all" ? insights : insights.filter((insight) => insight.category === tab);

  return (
    <>
      <PageHeader
        eyebrow="AI Insights"
        title="What your data is telling you"
        description="Every card below is produced by a detector that found real evidence in your dataset. Figures are recomputed on each dataset change."
      />

      <div className="flex flex-wrap items-center gap-3">
        <DatasetPill />
      </div>

      <Tabs
        items={CATEGORY_TABS.map((tabItem) => ({
          value: tabItem.value,
          label: tabItem.label,
          count: tabItem.value === "all" ? insights.length : counts.get(tabItem.value) ?? 0,
        }))}
        value={tab}
        onChange={setTab}
        className="w-full sm:w-fit"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No insights in this category"
          description="Detectors only produce a card when they find real evidence. Try another category, or load a dataset with a date column and more numeric measures."
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filtered.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </section>
      )}
    </>
  );
}
