"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLUMN_TYPE_STYLES, LIMITS } from "@/lib/constants";
import { formatCell } from "@/lib/format";
import { cn } from "@/lib/utils";
import { queryTable } from "@/services/analyticsService";
import type { Dataset } from "@/types";

interface DataTableProps {
  dataset: Dataset;
  /** Restrict the table to a subset of columns (e.g. issue drill-downs). */
  initialColumns?: string[];
  pageSize?: number;
  className?: string;
}

/**
 * Production-grade table: search, sort, column visibility, type indicators
 * and pagination. Only one page of rows is ever rendered, so a 50k-row
 * dataset stays as responsive as a 50-row one.
 */
export function DataTable({ dataset, initialColumns, pageSize, className }: DataTableProps) {
  const allColumns = useMemo(() => dataset.columns.map((column) => column.name), [dataset]);

  const [visible, setVisible] = useState<string[]>(initialColumns ?? allColumns);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize ?? LIMITS.defaultPageSize);
  const [showColumns, setShowColumns] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(initialColumns ?? allColumns);
    setPage(1);
    setSortKey(null);
    setSearch("");
  }, [dataset.meta.id, allColumns, initialColumns]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setShowColumns(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const result = useMemo(
    () =>
      queryTable(dataset, {
        search,
        sortKey,
        sortDir,
        page,
        pageSize: size,
        visibleColumns: visible,
      }),
    [dataset, search, sortKey, sortDir, page, size, visible],
  );

  const toggleSort = (column: string) => {
    if (sortKey === column) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const toggleColumn = (column: string) => {
    setVisible((current) =>
      current.includes(column)
        ? current.length > 1
          ? current.filter((name) => name !== column)
          : current
        : [...allColumns.filter((name) => current.includes(name) || name === column)],
    );
  };

  const profileFor = (name: string) => dataset.columns.find((column) => column.name === name);

  return (
    <div className={cn("glass-strong overflow-hidden", className)}>
      {/* Toolbar ---------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3.5 sm:px-5">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search rows..."
            aria-label="Search table rows"
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-8 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-cyan/40 focus:outline-none"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="relative" ref={columnsRef}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Columns3 className="h-3.5 w-3.5" />}
            onClick={() => setShowColumns((value) => !value)}
          >
            Columns
            <span className="text-ink-faint">
              {visible.length}/{allColumns.length}
            </span>
          </Button>

          {showColumns ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong absolute right-0 top-11 z-30 max-h-72 w-60 overflow-y-auto scroll-slim rounded-xl p-1.5"
            >
              {allColumns.map((column) => {
                const profile = profileFor(column);
                const checked = visible.includes(column);
                return (
                  <button
                    key={column}
                    onClick={() => toggleColumn(column)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px]",
                        checked
                          ? "border-brand-cyan/50 bg-brand-cyan/20 text-brand-cyan"
                          : "border-white/15 text-transparent",
                      )}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className="flex-1 truncate text-ink-muted">{column}</span>
                    <span className="text-[10px] uppercase text-ink-faint">
                      {profile ? COLUMN_TYPE_STYLES[profile.type]?.short : ""}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-[12px] text-ink-faint">
          <Filter className="h-3.5 w-3.5" />
          <span>
            {result.total.toLocaleString()} of {dataset.rowCount.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* Table ------------------------------------------------------------ */}
      {result.total === 0 ? (
        <EmptyState
          className="m-4 border-0"
          icon={<Search className="h-5 w-5" />}
          title="No rows match that search"
          description="Try a different term, or clear the search to see the full dataset."
          action={
            <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="w-12 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                  #
                </th>
                {visible.map((column) => {
                  const profile = profileFor(column);
                  const style = profile ? COLUMN_TYPE_STYLES[profile.type] : undefined;
                  const active = sortKey === column;
                  return (
                    <th key={column} className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => toggleSort(column)}
                        className="group inline-flex items-center gap-2"
                      >
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                            style?.className ?? "border-white/10 text-ink-faint",
                          )}
                        >
                          {style?.short ?? "?"}
                        </span>
                        <span
                          className={cn(
                            "text-[12px] font-medium transition-colors",
                            active ? "text-ink" : "text-ink-muted group-hover:text-ink",
                          )}
                        >
                          {column}
                        </span>
                        {active ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-brand-cyan" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-brand-cyan" />
                          )
                        ) : null}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr
                  key={`${result.page}-${index}`}
                  className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-4 py-2.5 text-[12px] tabular-nums text-ink-faint">
                    {(result.page - 1) * size + index + 1}
                  </td>
                  {visible.map((column) => {
                    const profile = profileFor(column);
                    const value = row[column];
                    const missing = value === null || value === undefined || value === "";
                    return (
                      <td
                        key={column}
                        className={cn(
                          "max-w-[280px] truncate px-4 py-2.5 text-[13px]",
                          missing
                            ? "text-ink-faint"
                            : profile?.type === "numeric"
                              ? "tabular-nums text-ink"
                              : "text-ink-muted",
                        )}
                        title={missing ? "Missing value" : String(value)}
                      >
                        {missing ? (
                          <Badge tone="warning" className="px-1.5 py-0 text-[10px]">
                            null
                          </Badge>
                        ) : (
                          formatCell(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination ------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[12px] text-ink-faint">
          <span>Rows per page</span>
          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
            className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-ink focus:outline-none"
          >
            {LIMITS.tablePageSizes.map((option) => (
              <option key={option} value={option} className="bg-base-100">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-faint">
            Page {result.page} of {result.pageCount}
          </span>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            disabled={result.page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            disabled={result.page >= result.pageCount}
            onClick={() => setPage((value) => Math.min(result.pageCount, value + 1))}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
