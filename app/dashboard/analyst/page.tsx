"use client";

import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, BarChart3, Database, Zap, Eye, EyeOff } from "lucide-react";
import { DatasetContext } from "@/hooks/useDataset";

export default function AnalystMode() {
  const context = useContext(DatasetContext);
  if (!context) return null;

  const { dataset, quality, insights } = context;
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showCorrelations, setShowCorrelations] = useState(true);

  // Find numeric columns for correlation analysis
  const numericCols = dataset.columns.filter((col) => col.type === "numeric");

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Analyst Dashboard</h1>
          <p className="text-lg text-ink-muted">
            Deep dive into your data with advanced profiling, correlation analysis, and
            anomaly detection.
          </p>
        </div>

        {/* Control Bar */}
        <div className="glass p-4 flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white">
            <Filter className="w-4 h-4" />
            Add Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white">
            <Database className="w-4 h-4" />
            Raw Data
          </button>
          <button
            onClick={() => setShowCorrelations(!showCorrelations)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium text-white ml-auto"
          >
            {showCorrelations ? (
              <>
                <Eye className="w-4 h-4" />
                Hide Correlations
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Show Correlations
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Profiling */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-brand-cyan" />
                <h2 className="text-2xl font-bold text-white">Column Profiles</h2>
              </div>

              <div className="space-y-4">
                {dataset.columns.map((col, idx) => (
                  <motion.div
                    key={idx}
                    onClick={() => setSelectedColumn(col.name)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedColumn === col.name
                        ? "border-brand-cyan bg-brand-cyan/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{col.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-ink-muted">
                        {col.type}
                      </span>
                    </div>

                    {col.statistics && (
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-ink-muted text-xs">Mean</div>
                          <div className="font-semibold text-brand-cyan">
                            {col.statistics.mean?.toFixed(2) || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted text-xs">Median</div>
                          <div className="font-semibold text-brand-cyan">
                            {col.statistics.median?.toFixed(2) || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted text-xs">Std Dev</div>
                          <div className="font-semibold text-brand-purple">
                            {col.statistics.stdDev?.toFixed(2) || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted text-xs">Missing</div>
                          <div className="font-semibold text-danger">
                            {col.statistics.missingCount || 0}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Distribution bar */}
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                        style={{
                          width: `${col.statistics ? Math.min(100, (100 * col.statistics.uniqueCount) / dataset.rowCount) : 50}%`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Anomaly Detection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-danger" />
                <h2 className="text-2xl font-bold text-white">Anomalies Detected</h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    record: 1245,
                    metric: "Revenue",
                    value: "$8,420",
                    expected: "$2,100",
                    severity: "High",
                  },
                  {
                    record: 3891,
                    metric: "Customer Age",
                    value: "187 years",
                    expected: "35-65",
                    severity: "Medium",
                  },
                  {
                    record: 5723,
                    metric: "Order Count",
                    value: "412",
                    expected: "2-8",
                    severity: "High",
                  },
                ].map((anom, idx) => (
                  <div key={idx} className="border-l-4 border-danger pl-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">
                        Record #{anom.record}: {anom.metric}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded bg-danger/20 text-danger">
                        {anom.severity}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted">
                      Value: <span className="text-white font-medium">{anom.value}</span> (Expected:{" "}
                      {anom.expected})
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Statistics & Correlations */}
          <div className="space-y-6">
            {/* Data Quality Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-8 space-y-4 text-center"
            >
              <div className="text-6xl font-bold text-brand-cyan">{quality.overallScore}%</div>
              <p className="text-ink-muted">Data Quality Score</p>

              <div className="space-y-3 pt-4 border-t border-white/10 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Completeness</span>
                  <span className="font-semibold text-white">
                    {Math.round(quality.completenessScore)}%
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${quality.completenessScore}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm pt-3">
                  <span className="text-ink-muted">Validity</span>
                  <span className="font-semibold text-white">{Math.round(quality.validityScore)}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${quality.validityScore}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm pt-3">
                  <span className="text-ink-muted">Consistency</span>
                  <span className="font-semibold text-white">
                    {Math.round(quality.consistencyScore)}%
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${quality.consistencyScore}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Key Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-8 space-y-3"
            >
              <h3 className="font-bold text-white mb-4">Dataset Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Total Rows</span>
                  <span className="font-semibold text-brand-cyan">
                    {dataset.rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Columns</span>
                  <span className="font-semibold text-brand-purple">{dataset.columnCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Duplicate Rows</span>
                  <span className="font-semibold text-danger">{quality.duplicateRowsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Missing Values</span>
                  <span className="font-semibold text-danger">{quality.totalMissingCells}</span>
                </div>
              </div>
            </motion.div>

            {/* Top Insights */}
            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-8 space-y-3"
              >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-cyan" />
                  AI Insights
                </h3>
                <div className="space-y-2 text-sm">
                  {insights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-brand-cyan mt-1">→</span>
                      <div>
                        <p className="font-medium text-white">{insight.title}</p>
                        <p className="text-xs text-ink-muted mt-1">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
