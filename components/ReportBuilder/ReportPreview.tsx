import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { ReportData } from "@/services/reportService";

interface ReportPreviewProps {
  data: ReportData;
  onDownload: () => void;
  isGenerating?: boolean;
}

export function ReportPreview({ data, onDownload, isGenerating }: ReportPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 space-y-6"
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">{data.title}</h3>
          <p className="text-sm text-ink-muted mt-1">
            Generated on {data.generatedDate.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onDownload}
          disabled={isGenerating}
          className="px-6 py-3 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-bold transition flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Preview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-xs text-ink-muted mb-1">Dataset Rows</div>
          <div className="text-2xl font-bold text-brand-cyan">
            {data.datasetRows.toLocaleString()}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-xs text-ink-muted mb-1">Columns</div>
          <div className="text-2xl font-bold text-brand-cyan">{data.datasetColumns}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-xs text-ink-muted mb-1">Quality Score</div>
          <div className="text-2xl font-bold text-success">{data.qualityScore}%</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-xs text-ink-muted mb-1">Confidence</div>
          <div className="text-2xl font-bold text-brand-purple">
            {data.executiveSummary.confidence}%
          </div>
        </div>
      </div>

      {/* Executive Summary Preview */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Executive Summary</h4>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          {data.executiveSummary.overview}
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm">Key Findings</h5>
            <ul className="space-y-2">
              {data.executiveSummary.keyFindings.map((finding, idx) => (
                <li key={idx} className="text-xs text-ink-muted flex gap-2">
                  <span className="text-brand-cyan flex-shrink-0">→</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3 text-sm">Recommendations</h5>
            <ul className="space-y-2">
              {data.executiveSummary.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-ink-muted flex gap-2">
                  <span className="text-brand-cyan flex-shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Key Metrics</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.keyMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-ink-muted mb-1 truncate">{metric.label}</div>
              <div className="text-xl font-bold text-white">{metric.value}</div>
              {metric.change && (
                <div
                  className={`text-xs mt-1 ${
                    metric.trend === "up" ? "text-success" : "text-danger"
                  }`}
                >
                  {metric.change} {metric.trend === "up" ? "↑" : "↓"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights Preview */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Key Insights</h4>
        <div className="space-y-2">
          {data.insights.map((insight, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="text-brand-cyan flex-shrink-0 mt-1">→</span>
              <p className="text-sm text-ink-muted">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
