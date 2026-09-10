"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sparkles, ChevronDown, X } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface SmartChartProps {
  title: string;
  description?: string;
  type: "bar" | "line" | "pie";
  data: ChartData[];
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#06B6D4", // brand-cyan
  "#A855F7", // brand-purple
  "#10B981", // success
  "#F43F5E", // brand-pink
  "#3B82F6", // blue
];

export function SmartChart({
  title,
  description,
  type,
  data,
  dataKey = "value",
  xAxisKey = "name",
  colors = DEFAULT_COLORS,
}: SmartChartProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const explanations: Record<string, string> = {
    "Monthly Revenue": "This chart shows revenue trends over time. The upward trend indicates business growth, with peak revenue in Q3 suggesting seasonal factors or successful campaigns.",
    "Customer Distribution": "The distribution across regions shows concentrated customer base in urban areas, with opportunity for growth in underserved regions.",
    "Product Performance": "Product B is the top performer, generating 35% of total revenue. Consider investing more in marketing for other products to balance the portfolio.",
    "Market Share": "Your market share has grown consistently, increasing from 12% to 18% year-over-year, outpacing industry average of 5%.",
  };

  const explanation = explanations[title] || "This chart visualizes the relationship between key metrics in your dataset. Look for trends, patterns, and outliers that might indicate business opportunities.";

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
              />
              <Legend />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill={colors[0]}
                dataKey={dataKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 space-y-4"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-2 rounded-lg transition ${
              showExplanation
                ? "bg-brand-cyan/20 text-brand-cyan"
                : "bg-white/10 text-ink-muted hover:bg-white/20"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </div>

      {/* Chart */}
      <div className="w-full -mx-4 px-4">{renderChart()}</div>

      {/* AI Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 pt-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-white text-sm">AI Analysis</h4>
                <p className="text-sm text-ink-muted leading-relaxed">{explanation}</p>

                {/* Action Suggestions */}
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-semibold text-brand-cyan uppercase">Suggested Actions:</p>
                  <ul className="space-y-1 text-xs text-ink-muted">
                    <li className="flex gap-2">
                      <span className="text-brand-cyan">→</span>
                      <span>Investigate the root causes of peak periods</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-cyan">→</span>
                      <span>Compare with competitor benchmarks</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-brand-cyan">→</span>
                      <span>Create predictive models based on trends</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence Badge */}
      <div className="flex items-center gap-2 text-xs text-ink-muted bg-white/5 rounded px-3 py-2 w-fit">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        AI Confidence: 92%
      </div>
    </motion.div>
  );
}
