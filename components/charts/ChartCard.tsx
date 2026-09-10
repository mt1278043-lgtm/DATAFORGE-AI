"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Download, Maximize2, Minimize2 } from "lucide-react";

import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { downloadBlob, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ChartPoint, ChartType } from "@/types";

interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartPoint[];
  type: ChartType;
  controls?: ReactNode;
  height?: number;
  yLabel?: string;
  xLabel?: string;
  className?: string;
  footer?: ReactNode;
}

/**
 * Premium chart container: title, description, inline controls, CSV export
 * and a fullscreen view. Used across Analytics, Overview and Predictions.
 */
export function ChartCard({
  title,
  description,
  data,
  type,
  controls,
  height = 320,
  yLabel,
  xLabel,
  className,
  footer,
}: ChartCardProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const toast = useToast();

  const exportCsv = () => {
    if (data.length === 0) {
      toast.warning("Nothing to export", "This chart has no data points yet.");
      return;
    }
    const header = type === "scatter" ? "x,value" : "label,value";
    const body = data
      .map((point) =>
        type === "scatter"
          ? `${point.x ?? ""},${point.value}`
          : `"${String(point.label).replace(/"/g, '""')}",${point.value}`,
      )
      .join("\n");
    downloadBlob(`${header}\n${body}`, `${slugify(title) || "chart"}.csv`, "text/csv;charset=utf-8;");
    toast.success("Chart exported", `${data.length} data points saved as CSV.`);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn("glass-strong edge-highlight overflow-hidden", className)}
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
            {description ? (
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {controls}
            <Button
              variant="ghost"
              size="icon"
              onClick={exportCsv}
              aria-label="Export chart data as CSV"
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFullscreen(true)}
              aria-label="Open chart fullscreen"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="px-2 py-5 sm:px-4">
          <ChartRenderer data={data} type={type} height={height} yLabel={yLabel} xLabel={xLabel} />
        </div>

        {footer ? (
          <div className="border-t border-white/[0.06] px-5 py-3.5 text-[12px] text-ink-muted sm:px-6">
            {footer}
          </div>
        ) : null}
      </motion.section>

      <Modal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={title}
        description={description}
        size="full"
        footer={
          <Button variant="secondary" size="sm" icon={<Minimize2 className="h-4 w-4" />} onClick={() => setFullscreen(false)}>
            Exit fullscreen
          </Button>
        }
      >
        <ChartRenderer data={data} type={type} height={520} yLabel={yLabel} xLabel={xLabel} />
      </Modal>
    </>
  );
}
