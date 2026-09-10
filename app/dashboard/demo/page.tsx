"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  Zap,
  BarChart3,
  Brain,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type DemoPhase = "upload" | "processing" | "insights" | "visualization" | "complete";

const phases = [
  {
    id: "upload",
    label: "Upload Dataset",
    description: "Import your CSV or Excel file",
    icon: Upload,
    duration: 2,
  },
  {
    id: "processing",
    label: "Data Processing",
    description: "Parse and validate data",
    icon: Zap,
    duration: 3,
  },
  {
    id: "insights",
    label: "AI Analysis",
    description: "Generate insights with machine learning",
    icon: Brain,
    duration: 3,
  },
  {
    id: "visualization",
    label: "Visualization",
    description: "Create interactive charts and dashboards",
    icon: BarChart3,
    duration: 2,
  },
  {
    id: "complete",
    label: "Complete",
    description: "Ready to explore your data",
    icon: CheckCircle2,
    duration: 1,
  },
];

export default function DemoPage() {
  const [currentPhase, setCurrentPhase] = useState<DemoPhase>("upload");
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const currentPhaseIndex = phases.findIndex((p) => p.id === currentPhase);
  const isComplete = currentPhase === "complete";

  const handleNextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhase(phases[currentPhaseIndex + 1].id as DemoPhase);
    }
  };

  const handleReset = () => {
    setCurrentPhase("upload");
  };

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-brand-cyan" />
            Interactive Demo
          </h1>
          <p className="text-lg text-ink-muted">Watch how DataForge AI transforms your data into actionable insights</p>
        </motion.div>

        {/* Main Demo Content */}
        <div className="glass p-12 space-y-12">
          {/* Phase Timeline */}
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-white">Analysis Pipeline</h3>

            <div className="space-y-4">
              {phases.map((phase, idx) => {
                const phaseIndex = phases.findIndex((p) => p.id === currentPhase);
                const isActive = idx === phaseIndex;
                const isCompleted = idx < phaseIndex;
                const PhaseIcon = phase.icon;

                return (
                  <motion.div
                    key={phase.id}
                    className="relative"
                    initial={false}
                    animate={{ opacity: 1 }}
                  >
                    {/* Connecting Line */}
                    {idx < phases.length - 1 && (
                      <motion.div
                        className="absolute left-7 top-[60px] w-0.5 h-12 bg-gradient-to-b from-white/30 to-white/10"
                        initial={{ height: 0 }}
                        animate={{
                          height: isCompleted ? 48 : isActive ? 48 : 48,
                          background: isCompleted
                            ? "linear-gradient(to bottom, rgba(34, 197, 94), rgba(34, 197, 94))"
                            : "linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))",
                        }}
                        transition={{ duration: 0.6 }}
                      />
                    )}

                    {/* Phase Item */}
                    <motion.div
                      className={`flex gap-4 p-4 rounded-lg border-2 transition ${
                        isActive
                          ? "border-brand-cyan bg-brand-cyan/10"
                          : isCompleted
                            ? "border-success bg-success/10"
                            : "border-white/10 bg-white/5"
                      }`}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        borderColor: isActive
                          ? "rgba(34, 211, 238, 0.5)"
                          : isCompleted
                            ? "rgba(34, 197, 94, 0.5)"
                            : "rgba(255, 255, 255, 0.1)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Icon */}
                      <motion.div
                        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-brand-cyan/20 text-brand-cyan"
                            : isCompleted
                              ? "bg-success/20 text-success"
                              : "bg-white/10 text-ink-muted"
                        }`}
                        animate={{
                          rotate: isActive ? 0 : isCompleted ? 0 : 0,
                        }}
                      >
                        <PhaseIcon className="w-6 h-6" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${isActive ? "text-brand-cyan" : isCompleted ? "text-success" : "text-white"}`}>
                          {phase.label}
                        </h4>
                        <p className="text-xs text-ink-muted mt-1">{phase.description}</p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0 text-right">
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-success" />}
                        {isActive && (
                          <motion.div
                            className="w-5 h-5"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="w-5 h-5 text-brand-cyan" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Phase Details */}
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="border-t border-white/10 pt-8 space-y-6"
          >
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">
                {phases[currentPhaseIndex].label}
              </h4>
              <p className="text-ink-muted">{phases[currentPhaseIndex].description}</p>
            </div>

            {/* Phase-specific Content */}
            <div className="space-y-4">
              {currentPhase === "upload" && (
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-6 space-y-3">
                  <h5 className="font-semibold text-white">Dataset Upload</h5>
                  <p className="text-sm text-ink-muted">
                    Start by uploading a CSV or Excel file. DataForge AI will instantly parse your data and prepare it for analysis.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-brand-cyan">
                    <CheckCircle2 className="w-4 h-4" />
                    Supports CSV, Excel, and JSON files
                  </div>
                </div>
              )}

              {currentPhase === "processing" && (
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-6 space-y-3">
                  <h5 className="font-semibold text-white">Intelligent Processing</h5>
                  <p className="text-sm text-ink-muted">
                    Our engine analyzes data types, detects anomalies, and validates data quality automatically.
                  </p>
                  <div className="space-y-2">
                    {["Type Detection", "Anomaly Detection", "Data Validation", "Quality Scoring"].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-brand-cyan">
                        <CheckCircle2 className="w-4 h-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentPhase === "insights" && (
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-6 space-y-3">
                  <h5 className="font-semibold text-white">AI-Powered Analysis</h5>
                  <p className="text-sm text-ink-muted">
                    Machine learning algorithms identify patterns, trends, and opportunities in your data.
                  </p>
                  <div className="space-y-2">
                    {["Trend Detection", "Correlation Analysis", "Anomaly Highlighting", "Opportunity Identification"].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-brand-cyan">
                        <CheckCircle2 className="w-4 h-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentPhase === "visualization" && (
                <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-6 space-y-3">
                  <h5 className="font-semibold text-white">Interactive Dashboards</h5>
                  <p className="text-sm text-ink-muted">
                    Explore your data through beautiful, interactive visualizations and dashboards.
                  </p>
                  <div className="space-y-2">
                    {["Charts & Graphs", "Correlation Matrix", "Trend Analysis", "Executive Dashboard"].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-brand-cyan">
                        <CheckCircle2 className="w-4 h-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentPhase === "complete" && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-6 space-y-3">
                  <h5 className="font-semibold text-white">Analysis Complete</h5>
                  <p className="text-sm text-ink-muted">
                    Your data is ready for exploration. Access dashboards, generate reports, and make data-driven decisions.
                  </p>
                  <div className="space-y-2">
                    {["View Executive Dashboard", "Generate Reports", "Export Insights", "Share Findings"].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-ink-muted">
                <span>Progress</span>
                <span>{Math.round(((currentPhaseIndex + 1) / phases.length) * 100)}%</span>
              </div>
              <motion.div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentPhaseIndex + 1) / phases.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoPlay}
                onChange={(e) => setIsAutoPlay(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-white">Auto-play demo</span>
            </label>

            <div className="flex-1" />

            {isComplete ? (
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-semibold transition"
              >
                Restart Demo
              </button>
            ) : (
              <button
                onClick={handleNextPhase}
                className="px-6 py-2 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-semibold transition flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: "Support Multiple Formats",
              description: "Works with CSV, Excel, JSON and more",
            },
            {
              icon: Sparkles,
              title: "AI-Powered Insights",
              description: "Machine learning detects patterns automatically",
            },
            {
              icon: BarChart3,
              title: "Beautiful Visualizations",
              description: "Interactive charts and professional dashboards",
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-6 space-y-3 text-center"
              >
                <Icon className="w-8 h-8 text-brand-cyan mx-auto" />
                <h4 className="font-semibold text-white">{card.title}</h4>
                <p className="text-sm text-ink-muted">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
