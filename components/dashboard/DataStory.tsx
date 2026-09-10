"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Check } from "lucide-react";
import type { DataStory } from "@/services/dataStoryService";

interface DataStoryProps {
  story: DataStory;
}

export function DataStory({ story }: DataStoryProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gradient-brand">{story.title}</h2>
        <p className="text-ink-muted">{story.summary}</p>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-success">
            {story.confidence}% confidence based on data analysis
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {story.chapters.map((chapter, idx) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-8"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-2 w-6 h-6 rounded-full border-2 border-brand-cyan bg-base flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-brand-cyan" />
            </div>

            {/* Timeline line */}
            {idx < story.chapters.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan to-transparent" />
            )}

            {/* Chapter content */}
            <div className="glass p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {chapter.title}
                    {chapter.trend === "up" && (
                      <TrendingUp className="w-5 h-5 text-success" />
                    )}
                    {chapter.trend === "down" && (
                      <TrendingDown className="w-5 h-5 text-danger" />
                    )}
                    {chapter.trend === "neutral" && (
                      <Minus className="w-5 h-5 text-brand-cyan" />
                    )}
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">{chapter.description}</p>
                </div>

                {/* Metric Badge */}
                {chapter.value && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-cyan">{chapter.value}</div>
                    {chapter.metric && (
                      <div className="text-xs text-ink-muted mt-1">{chapter.metric}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Confidence indicator */}
              {chapter.confidence && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${chapter.confidence}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                    />
                  </div>
                  <span className="text-ink-faint">{chapter.confidence}%</span>
                </div>
              )}

              {/* Evidence list */}
              {chapter.evidence && chapter.evidence.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  {chapter.evidence.map((evidence, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                      <Check className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                      <span>{evidence}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to action */}
      <div className="glass p-6 border-l-2 border-brand-purple space-y-3">
        <h4 className="font-semibold text-white">Next Steps</h4>
        <p className="text-sm text-ink-muted">
          Use these insights to inform your strategy and make data-driven decisions.
        </p>
        <button className="px-4 py-2 rounded-lg bg-brand-purple/20 border border-brand-purple/50 text-sm font-medium text-brand-purple hover:bg-brand-purple/30 transition">
          Export Story as PDF
        </button>
      </div>
    </div>
  );
}
