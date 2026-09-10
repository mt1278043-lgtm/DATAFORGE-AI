"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Command, Menu, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useAiStatus } from "@/hooks/useAiStatus";
import { useDataset } from "@/hooks/useDataset";
import { DASHBOARD_NAV } from "@/lib/navigation";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onOpenNav: () => void;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  at: number;
  tone: "cyan" | "violet" | "success";
}

export function Topbar({ onOpenNav }: TopbarProps) {
  const router = useRouter();
  const { dataset, quality, insights } = useDataset();
  const { status } = useAiStatus();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo<Notification[]>(
    () => [
      {
        id: "profile",
        title: "Dataset profiled",
        body: `${dataset.rowCount.toLocaleString()} rows and ${dataset.columnCount} columns analysed.`,
        at: Date.now() - 1000 * 60 * 3,
        tone: "cyan",
      },
      {
        id: "insights",
        title: `${insights.length} insights generated`,
        body: insights[0]?.summary ?? "No signals detected in the current dataset.",
        at: Date.now() - 1000 * 60 * 12,
        tone: "violet",
      },
      {
        id: "quality",
        title: `Data quality ${quality.score}%`,
        body: `${quality.grade} - ${quality.issues.length} issue${quality.issues.length === 1 ? "" : "s"} to review.`,
        at: Date.now() - 1000 * 60 * 46,
        tone: "success",
      },
    ],
    [dataset, insights, quality],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const pages = DASHBOARD_NAV.filter(
      (item) =>
        item.label.toLowerCase().includes(term) || item.description.toLowerCase().includes(term),
    ).map((item) => ({ kind: "Page" as const, label: item.label, href: item.href }));
    const columns = dataset.columns
      .filter((column) => column.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map((column) => ({
        kind: "Column" as const,
        label: `${column.name} (${column.type})`,
        href: "/dashboard/datasets",
      }));
    return [...pages, ...columns].slice(0, 8);
  }, [query, dataset.columns]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setQuery("");
    setFocused(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-base/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="rounded-xl border border-white/10 p-2 text-ink-muted transition-colors hover:text-ink lg:hidden"
        >
          <Menu className="h-4.5 w-4.5" style={{ height: "1.125rem", width: "1.125rem" }} />
        </button>

        {/* Search --------------------------------------------------------- */}
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 140)}
            placeholder="Search pages, columns, insights..."
            aria-label="Search"
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-16 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors duration-300 hover:border-white/[0.14] focus:border-brand-cyan/40 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-ink-faint sm:flex">
            <Command className="h-3 w-3" />K
          </span>

          <AnimatePresence>
            {focused && results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="glass-strong absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl p-1.5"
              >
                {results.map((result) => (
                  <button
                    key={`${result.kind}-${result.label}`}
                    onMouseDown={() => go(result.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
                  >
                    <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
                      {result.kind}
                    </span>
                    <span className="truncate">{result.label}</span>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* AI status --------------------------------------------------- */}
          <Badge
            tone={status.mode === "openai" ? "success" : "violet"}
            dot
            pulse
            className="hidden sm:inline-flex"
          >
            {status.mode === "openai" ? "AI Engine Online" : "Demo AI Engine"}
          </Badge>

          {/* Notifications ----------------------------------------------- */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications((value) => !value)}
              aria-label="Notifications"
              className={cn(
                "relative rounded-xl border border-white/[0.08] p-2.5 text-ink-muted transition-colors hover:text-ink",
                showNotifications && "bg-white/[0.06] text-ink",
              )}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-pink" />
            </button>

            <AnimatePresence>
              {showNotifications ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-strong absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl"
                >
                  <div className="border-b border-white/[0.07] px-4 py-3">
                    <p className="text-[13px] font-semibold text-ink">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto scroll-slim">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 border-b border-white/[0.05] px-4 py-3 last:border-0"
                      >
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            notification.tone === "cyan" && "bg-brand-cyan",
                            notification.tone === "violet" && "bg-brand-purple",
                            notification.tone === "success" && "bg-success",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-ink">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                            {notification.body}
                          </p>
                          <p className="mt-1 text-[11px] text-ink-faint">
                            {formatRelativeTime(notification.at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Profile ------------------------------------------------------ */}
          <button
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition-colors hover:border-white/[0.16]"
            aria-label="Account"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#22D3EE,#8B5CF6)] text-[12px] font-semibold text-white">
              AK
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[12.5px] font-medium text-ink">Alex Kim</span>
              <span className="block text-[11px] text-ink-faint">Analytics Lead</span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile AI status strip */}
      <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 py-2 sm:hidden">
        <Sparkles className="h-3 w-3 text-brand-purple" />
        <span className="text-[11px] text-ink-muted">
          {status.mode === "openai" ? "AI Engine Online" : "Demo AI Engine"}
        </span>
      </div>
    </header>
  );
}
