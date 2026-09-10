"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileBarChart, FileText, Printer, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetPill } from "@/components/dashboard/DatasetPill";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAiStatus } from "@/hooks/useAiStatus";
import { useDataset } from "@/hooks/useDataset";
import { useToast } from "@/hooks/useToast";
import { downloadBlob, sleep, slugify } from "@/lib/utils";
import { generateReport, reportToHtml, reportToMarkdown } from "@/services/reportService";
import type { GeneratedReport } from "@/types";

export default function ReportsPage() {
  const { dataset } = useDataset();
  const { status } = useAiStatus();
  const toast = useToast();

  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      await sleep(850);
      setReport(generateReport(dataset, status.mode));
      toast.success("Report generated", "Nine sections written from the current dataset.");
    } catch {
      toast.error("Report failed", "The report could not be generated for this dataset.");
    } finally {
      setGenerating(false);
    }
  };

  const exportHtml = () => {
    if (!report) return;
    downloadBlob(reportToHtml(report), `${slugify(report.title)}.html`, "text/html;charset=utf-8;");
    toast.success("Report exported", "Saved as a standalone HTML file you can print to PDF.");
  };

  const exportMarkdown = () => {
    if (!report) return;
    downloadBlob(reportToMarkdown(report), `${slugify(report.title)}.md`, "text/markdown;charset=utf-8;");
    toast.success("Report exported", "Saved as Markdown.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="AI Report Generator"
        description="An executive-ready briefing assembled from your dataset: summary, metrics, trends, anomalies, insights, recommendations and a forecast."
        actions={
          <>
            {report ? (
              <>
                <Button variant="secondary" icon={<FileText className="h-4 w-4" />} onClick={exportMarkdown}>
                  Markdown
                </Button>
                <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={exportHtml}>
                  Export Report
                </Button>
              </>
            ) : null}
            <Button icon={<Sparkles className="h-4 w-4" />} loading={generating} onClick={() => void generate()}>
              {report ? "Regenerate" : "Generate report"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <DatasetPill />
        <Badge tone={status.mode === "openai" ? "success" : "violet"} dot>
          {status.mode === "openai" ? `Narrative engine: ${status.model}` : "Narrative engine: local"}
        </Badge>
      </div>

      {generating ? (
        <Card className="space-y-4 p-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-full" />
          ))}
        </Card>
      ) : null}

      {!report && !generating ? (
        <EmptyState
          icon={<FileBarChart className="h-5 w-5" />}
          title="No report generated yet"
          description="Generate a full intelligence report from the current dataset. Every figure is recomputed at generation time, so the report always matches the data in front of you."
          action={
            <Button icon={<Sparkles className="h-4 w-4" />} onClick={() => void generate()}>
              Generate report
            </Button>
          }
        />
      ) : null}

      {report && !generating ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card highlight>
            <CardHeader
              icon={<FileBarChart className="h-4 w-4" />}
              title="Report preview"
              description={`Generated ${report.generatedAt}`}
              actions={
                <Button size="sm" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={exportHtml}>
                  Export
                </Button>
              }
            />
            <CardBody className="space-y-8">
              {/* Cover */}
              <header className="border-b border-white/[0.06] pb-6">
                <h2 className="text-balance text-[26px] font-semibold tracking-[-0.03em] text-gradient-brand sm:text-[30px]">
                  {report.title}
                </h2>
                <p className="mt-2 text-[13.5px] text-ink-muted">{report.subtitle}</p>
              </header>

              {/* KPIs */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {report.kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                      {kpi.value}
                    </p>
                    {kpi.delta ? (
                      <p className="mt-0.5 text-[11.5px] text-brand-cyan">{kpi.delta}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Sections */}
              <div className="space-y-7">
                {report.sections.map((section, index) => (
                  <motion.section
                    key={section.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.5) }}
                    className="border-t border-white/[0.06] pt-6 first:border-0 first:pt-0"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-[11px] font-semibold tabular-nums text-brand-purple">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                        {section.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">{section.body}</p>
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2.5">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-cyan" />
                            <span className="text-[13px] leading-relaxed text-ink-muted">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.section>
                ))}
              </div>

              <footer className="border-t border-white/[0.06] pt-5 text-[11.5px] text-ink-faint">
                Figures are computed directly from {report.datasetName}. Predictions are simulated and
                labelled as such.
              </footer>
            </CardBody>
          </Card>
        </motion.div>
      ) : null}
    </>
  );
}
