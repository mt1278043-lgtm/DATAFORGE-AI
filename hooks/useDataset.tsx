"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { getDemoDataset } from "@/data/demoDataset";
import { useToast } from "@/hooks/useToast";
import { FileParseError, parseFile } from "@/services/fileParser";
import { generateInsights } from "@/services/insightsService";
import { analyzeQuality } from "@/services/qualityService";
import { deriveKpis } from "@/services/analyticsService";
import type { Dataset, Insight, KpiDefinition, QualityReport } from "@/types";

type LoadState = "idle" | "parsing" | "profiling" | "ready" | "error";

interface DatasetContextValue {
  dataset: Dataset;
  isDemo: boolean;
  loadState: LoadState;
  progress: number;
  error: string | null;
  quality: QualityReport;
  insights: Insight[];
  kpis: KpiDefinition[];
  uploadFile: (file: File) => Promise<Dataset | null>;
  replaceDataset: (dataset: Dataset) => void;
  resetToDemo: () => void;
  clearError: () => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [dataset, setDataset] = useState<Dataset>(() => getDemoDataset());
  const [loadState, setLoadState] = useState<LoadState>("ready");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Derived analysis is memoised so navigating between pages never re-computes.
  const quality = useMemo(() => analyzeQuality(dataset), [dataset]);
  const insights = useMemo(() => generateInsights(dataset), [dataset]);
  const kpis = useMemo(() => deriveKpis(dataset), [dataset]);

  useEffect(() => {
    if (loadState !== "parsing" && loadState !== "profiling") return;
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(value + Math.random() * 12, 92));
    }, 220);
    return () => window.clearInterval(timer);
  }, [loadState]);

  const uploadFile = useCallback(
    async (file: File): Promise<Dataset | null> => {
      setError(null);
      setProgress(6);
      setLoadState("parsing");

      try {
        // Yield a frame so the upload animation can start before parsing blocks.
        await new Promise((resolve) => window.setTimeout(resolve, 120));
        setLoadState("profiling");
        const parsed = await parseFile(file);

        setProgress(100);
        setDataset(parsed);
        setLoadState("ready");
        toast.success(
          "Dataset ready",
          `${parsed.rowCount.toLocaleString()} rows and ${parsed.columnCount} columns profiled.`,
        );
        return parsed;
      } catch (caught) {
        const message =
          caught instanceof FileParseError
            ? caught.message
            : "We could not read that file. Try exporting it again as CSV or XLSX.";
        setError(message);
        setLoadState("error");
        setProgress(0);
        toast.error("Upload failed", message);
        return null;
      }
    },
    [toast],
  );

  const replaceDataset = useCallback((next: Dataset) => {
    setDataset(next);
    setLoadState("ready");
    setError(null);
  }, []);

  const resetToDemo = useCallback(() => {
    setDataset(getDemoDataset());
    setLoadState("ready");
    setError(null);
    setProgress(0);
    toast.info("Demo dataset restored", "Showing the built-in e-commerce dataset.");
  }, [toast]);

  const value = useMemo<DatasetContextValue>(
    () => ({
      dataset,
      isDemo: dataset.meta.source === "demo",
      loadState,
      progress,
      error,
      quality,
      insights,
      kpis,
      uploadFile,
      replaceDataset,
      resetToDemo,
      clearError: () => setError(null),
    }),
    [dataset, loadState, progress, error, quality, insights, kpis, uploadFile, replaceDataset, resetToDemo],
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const context = useContext(DatasetContext);
  if (!context) throw new Error("useDataset must be used inside <DatasetProvider>.");
  return context;
}

export { DatasetContext };
