"use client";

import { useContext, useMemo } from "react";
import { DatasetContext } from "@/hooks/useDataset";
import { DataStory } from "@/components/dashboard/DataStory";
import { generateDataStory } from "@/services/dataStoryService";
import { Download, Share2 } from "lucide-react";

export default function DataStoryPage() {
  const context = useContext(DatasetContext);
  if (!context) return null;

  const { dataset, insights, quality } = context;

  const story = useMemo(() => generateDataStory(dataset, insights, quality), [dataset, insights, quality]);

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="mb-12 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Data Story</h1>
              <p className="text-lg text-ink-muted">
                Your data tells a story. Here's what the numbers reveal.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Story metadata */}
          <div className="glass p-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-ink-muted">Report generated</p>
              <p className="font-semibold text-white">
                {story.generatedAt.toLocaleDateString()} at{" "}
                {story.generatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-sm text-ink-muted">Confidence Level</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                    style={{ width: `${story.confidence}%` }}
                  />
                </div>
                <span className="font-semibold text-brand-cyan">{story.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story content */}
        <DataStory story={story} />
      </div>
    </div>
  );
}
