"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileSpreadsheet, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useDataset } from "@/hooks/useDataset";
import { ACCEPTED_FILE_TYPES, LIMITS } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Dataset } from "@/types";

interface DropzoneProps {
  onLoaded?: (dataset: Dataset) => void;
  compact?: boolean;
}

export function Dropzone({ onLoaded, compact }: DropzoneProps) {
  const { uploadFile, loadState, progress, error, clearError } = useDataset();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = loadState === "parsing" || loadState === "profiling";

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      clearError();
      const dataset = await uploadFile(file);
      if (dataset && onLoaded) onLoaded(dataset);
      if (inputRef.current) inputRef.current.value = "";
    },
    [uploadFile, onLoaded, clearError],
  );

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy) void handleFiles(event.dataTransfer.files);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload a dataset"
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed text-center transition-all duration-500 ease-premium",
          compact ? "px-6 py-10" : "px-6 py-16 sm:py-20",
          dragging
            ? "border-brand-cyan/60 bg-brand-cyan/[0.06]"
            : "border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.035]",
          busy && "pointer-events-none",
        )}
      >
        {/* Ambient gradient */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700",
            (dragging || busy) && "opacity-100",
          )}
          style={{
            background:
              "radial-gradient(40rem 20rem at 50% 0%, rgba(34,211,238,0.14), transparent 70%)",
          }}
        />

        <motion.div
          animate={
            busy
              ? { scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }
              : dragging
                ? { scale: 1.1, y: -4 }
                : { scale: 1, y: 0 }
          }
          transition={busy ? { duration: 1.8, repeat: Infinity } : { duration: 0.4 }}
          className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
        >
          <span className="absolute inset-0 rounded-2xl bg-brand-violet/25 blur-xl" />
          <UploadCloud className="relative h-7 w-7 text-brand-cyan" />
        </motion.div>

        <p className="relative text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {busy ? "Analysing your dataset..." : "Drop your dataset here"}
        </p>
        <p className="relative mt-1.5 text-[13.5px] text-ink-muted">
          {busy ? (
            loadState === "parsing" ? (
              "Reading file contents"
            ) : (
              "Profiling columns, types and statistics"
            )
          ) : (
            <>
              or{" "}
              <span className="font-medium text-brand-cyan underline-offset-4 group-hover:underline">
                browse files
              </span>
            </>
          )}
        </p>

        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
          {ACCEPTED_FILE_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-wider text-ink-faint"
            >
              <FileSpreadsheet className="h-3 w-3" />
              {type}
            </span>
          ))}
          <span className="text-[11px] text-ink-faint">
            up to {formatBytes(LIMITS.maxFileSizeBytes)}
          </span>
        </div>

        <AnimatePresence>
          {busy ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-6 w-full max-w-sm"
            >
              <Progress value={progress} height="sm" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger/[0.07] px-4 py-3.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink">We could not read that file</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
