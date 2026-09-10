"use client";

import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, Settings, GripVertical, Plus, X } from "lucide-react";
import { DatasetContext } from "@/hooks/useDataset";

type ReportSection = "cover" | "toc" | "executive" | "charts" | "kpis" | "quality" | "insights" | "story" | "forecasts" | "recommendations";

interface ReportConfig {
  title: string;
  sections: ReportSection[];
  coverBranding: boolean;
  includeTableOfContents: boolean;
  pageNumbers: boolean;
  colorScheme: "professional" | "corporate" | "minimal";
}

const AVAILABLE_SECTIONS: { id: ReportSection; label: string; description: string; icon: any }[] = [
  { id: "cover", label: "Cover Page", description: "Professional report cover", icon: FileText },
  { id: "toc", label: "Table of Contents", description: "Auto-generated TOC", icon: FileText },
  { id: "executive", label: "Executive Summary", description: "AI-generated summary from data", icon: FileText },
  { id: "charts", label: "Data Charts", description: "Visualizations of key metrics", icon: FileText },
  { id: "kpis", label: "KPI Dashboard", description: "Key performance indicators", icon: FileText },
  { id: "quality", label: "Data Quality Report", description: "Quality scores and issues", icon: FileText },
  { id: "insights", label: "AI Insights", description: "Machine learning findings", icon: FileText },
  { id: "story", label: "Data Story", description: "Narrative data analysis", icon: FileText },
  { id: "forecasts", label: "Forecasts", description: "Predictions and trends", icon: FileText },
  { id: "recommendations", label: "Recommendations", description: "Action items and suggestions", icon: FileText },
];

export default function ReportsPage() {
  const context = useContext(DatasetContext);
  if (!context) return null;

  const { dataset } = context;
  const [config, setConfig] = useState<ReportConfig>({
    title: `${dataset.meta.name || "Dataset"} Report`,
    sections: ["cover", "toc", "executive", "charts", "kpis", "insights", "recommendations"],
    coverBranding: true,
    includeTableOfContents: true,
    pageNumbers: true,
    colorScheme: "professional",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const handleAddSection = (section: ReportSection) => {
    if (!config.sections.includes(section)) {
      setConfig({
        ...config,
        sections: [...config.sections, section],
      });
    }
  };

  const handleRemoveSection = (section: ReportSection) => {
    setConfig({
      ...config,
      sections: config.sections.filter((s) => s !== section),
    });
  };

  const handleDragStart = (section: ReportSection) => {
    setDraggedSection(section);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSection: ReportSection) => {
    if (!draggedSection) return;

    const sections = [...config.sections];
    const draggedIndex = sections.indexOf(draggedSection as ReportSection);
    const targetIndex = sections.indexOf(targetSection);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newSections = [...sections];
      [newSections[draggedIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[draggedIndex]];
      setConfig({ ...config, sections: newSections });
    }
    setDraggedSection(null);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Create filename
      const timestamp = new Date().toISOString().split("T")[0];
      const sanitizedTitle = config.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filename = `${sanitizedTitle}_${timestamp}.pdf`;

      // TODO: Replace with actual PDF generation using @react-pdf/renderer or pdfkit
      console.log("Report generated:", filename);
      alert(`Report generated: ${filename}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const unselectedSections = AVAILABLE_SECTIONS.filter((s) => !config.sections.includes(s.id));

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">AI Report Studio</h1>
          <p className="text-lg text-ink-muted">Generate professional, AI-powered PDF reports from your data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-white mb-2 block">Report Title</span>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-ink-muted focus:outline-none focus:border-brand-cyan"
                  placeholder="Enter report title"
                />
              </label>
            </motion.div>

            {/* Report Options */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Report Options</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeTableOfContents}
                    onChange={(e) => setConfig({ ...config, includeTableOfContents: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Include Table of Contents</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.pageNumbers}
                    onChange={(e) => setConfig({ ...config, pageNumbers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Add Page Numbers</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.coverBranding}
                    onChange={(e) => setConfig({ ...config, coverBranding: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Professional Branding</span>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-white mb-2 block">Color Scheme</span>
                  <select
                    value={config.colorScheme}
                    onChange={(e) => setConfig({ ...config, colorScheme: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="professional">Professional (Blue/Gray)</option>
                    <option value="corporate">Corporate (Navy/Black)</option>
                    <option value="minimal">Minimal (Black/White)</option>
                  </select>
                </label>
              </div>
            </motion.div>

            {/* Selected Sections */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Report Sections</h3>
              <p className="text-sm text-ink-muted">Drag to reorder sections</p>

              <div className="space-y-2">
                {config.sections.length === 0 ? (
                  <div className="text-center py-8 text-ink-muted">
                    <p>Add sections from the list below</p>
                  </div>
                ) : (
                  config.sections.map((section, idx) => {
                    const sectionInfo = AVAILABLE_SECTIONS.find((s) => s.id === section);
                    return (
                      <motion.div
                        key={section}
                        draggable
                        onDragStart={() => handleDragStart(section)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(section)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-move transition"
                        layout
                      >
                        <GripVertical className="w-4 h-4 text-ink-muted flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-white">{sectionInfo?.label}</div>
                          <div className="text-xs text-ink-muted">{sectionInfo?.description}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveSection(section)}
                          className="p-1 hover:bg-red-500/20 rounded transition text-danger"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Available Sections */}
            {unselectedSections.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Add More Sections</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unselectedSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleAddSection(section.id)}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/10 transition text-left"
                    >
                      <div className="font-medium text-white text-sm">{section.label}</div>
                      <div className="text-xs text-ink-muted mt-1">{section.description}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-8 h-fit sticky top-8 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Report Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Sections:</span>
                  <span className="text-white font-semibold">{config.sections.length}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Dataset Rows:</span>
                  <span className="text-white font-semibold">{dataset.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Columns:</span>
                  <span className="text-white font-semibold">{dataset.columnCount}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Report
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || config.sections.length === 0}
                className="w-full px-4 py-3 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-brand-cyan/50 border-t-brand-cyan rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>

            <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg p-3 text-xs text-brand-cyan">
              <p className="font-semibold mb-1">Pro Tip:</p>
              <p>Select at least 2-3 sections for a comprehensive report. Include Executive Summary and Recommendations for maximum impact.</p>
            </div>
          </motion.div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Report Preview</h3>
                <button onClick={() => setShowPreview(false)} className="text-ink-muted hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {config.sections.map((section) => {
                  const sectionInfo = AVAILABLE_SECTIONS.find((s) => s.id === section);
                  return (
                    <div key={section} className="border-b border-white/10 pb-4 last:border-0">
                      <h4 className="font-semibold text-white mb-2">{sectionInfo?.label}</h4>
                      <p className="text-sm text-ink-muted">
                        {section === "executive" && "AI-generated executive summary with key findings and recommendations based on your data"}
                        {section === "cover" && "Professional cover page with report title, date, and dataset information"}
                        {section === "charts" && "Interactive data visualizations of the most important metrics"}
                        {section === "kpis" && "Key performance indicators dashboard with trends and comparisons"}
                        {section === "quality" && "Detailed data quality assessment with issue breakdown"}
                        {section === "insights" && "Machine learning insights, patterns, and anomalies detected"}
                        {section === "story" && "Narrative analysis of your data journey and findings"}
                        {section === "forecasts" && "Predictive analytics and trend forecasts for future periods"}
                        {section === "recommendations" && "Actionable recommendations prioritized by potential impact"}
                        {section === "toc" && "Auto-generated table of contents linking to all sections"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
