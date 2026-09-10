"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, BarChart3, Brain, FileText, Settings, Zap, X } from "lucide-react";
import Link from "next/link";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  href?: string;
  category: string;
}

const COMMANDS: Command[] = [
  {
    id: "upload",
    label: "Upload Dataset",
    description: "Upload a new CSV or Excel file",
    icon: <Upload className="w-4 h-4" />,
    href: "/dashboard",
    category: "Dataset",
  },
  {
    id: "analytics",
    label: "Open Analytics",
    description: "View analytics and create charts",
    icon: <BarChart3 className="w-4 h-4" />,
    href: "/dashboard/analytics",
    category: "Dashboard",
  },
  {
    id: "insights",
    label: "AI Insights",
    description: "View AI-detected patterns and anomalies",
    icon: <Brain className="w-4 h-4" />,
    href: "/dashboard/insights",
    category: "Dashboard",
  },
  {
    id: "report",
    label: "Generate Report",
    description: "Create a professional report",
    icon: <FileText className="w-4 h-4" />,
    href: "/dashboard/reports",
    category: "Reports",
  },
  {
    id: "predictions",
    label: "View Predictions",
    description: "Run forecasts and predictions",
    icon: <Zap className="w-4 h-4" />,
    href: "/dashboard/predictions",
    category: "Dashboard",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Configure preferences and AI settings",
    icon: <Settings className="w-4 h-4" />,
    href: "/dashboard/settings",
    category: "Settings",
  },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch("");
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (cmd: Command) => {
    if (cmd.action) {
      cmd.action();
    }
    setIsOpen(false);
  };

  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-ink-muted"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
            >
              <div className="glass p-4 shadow-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <Search className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search commands..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedIndex(0);
                    }}
                    className="flex-1 bg-transparent outline-none text-white placeholder-ink-muted text-lg"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-ink-muted hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto scroll-slim py-2">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-8 text-center text-ink-muted">
                      No commands found
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category}>
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-faint mt-3 first:mt-0">
                          {category}
                        </div>
                        {filtered
                          .filter((c) => c.category === category)
                          .map((cmd, idx) => {
                            const commandIndex = filtered.indexOf(cmd);
                            const isSelected = commandIndex === selectedIndex;

                            return (
                              <motion.div
                                key={cmd.id}
                                animate={{
                                  backgroundColor: isSelected ? "rgba(255,255,255,0.05)" : "transparent",
                                }}
                                onClick={() => handleSelect(cmd)}
                                className="px-4 py-3 cursor-pointer group/item border-l-2 border-transparent hover:border-brand-cyan transition-colors"
                              >
                                {cmd.href ? (
                                  <Link href={cmd.href} className="flex items-center gap-3">
                                    <div className="text-brand-cyan">{cmd.icon}</div>
                                    <div className="flex-1">
                                      <div className="font-medium text-white">{cmd.label}</div>
                                      <div className="text-xs text-ink-muted">{cmd.description}</div>
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="text-brand-cyan">{cmd.icon}</div>
                                    <div className="flex-1">
                                      <div className="font-medium text-white">{cmd.label}</div>
                                      <div className="text-xs text-ink-muted">{cmd.description}</div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 px-4 py-2 text-xs text-ink-faint flex items-center justify-between">
                  <span>{filtered.length} results</span>
                  <span>↵ to select • ⌘K to close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
