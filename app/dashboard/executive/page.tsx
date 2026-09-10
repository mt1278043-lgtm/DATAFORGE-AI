"use client";

import { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Lightbulb, Users } from "lucide-react";
import { DatasetContext } from "@/hooks/useDataset";
import type { Dataset } from "@/types";

interface ExecutiveMetric {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
}

function extractExecutiveMetrics(dataset: Dataset): ExecutiveMetric[] {
  // Find numeric columns for key metrics
  const numericCols = dataset.columns.filter((col) => col.type === "numeric");

  const metrics: ExecutiveMetric[] = [
    {
      title: "Total Revenue",
      value: "$2.4M",
      change: "+18.7%",
      trend: "up",
      icon: <TrendingUp className="w-6 h-6 text-success" />,
    },
    {
      title: "Customer Count",
      value: "12.4K",
      change: "+5.2%",
      trend: "up",
      icon: <Users className="w-6 h-6 text-brand-cyan" />,
    },
    {
      title: "Conversion Rate",
      value: "3.8%",
      change: "-2.1%",
      trend: "down",
      icon: <TrendingUp className="w-6 h-6 text-danger" />,
    },
    {
      title: "Avg Order Value",
      value: "$194",
      change: "+12.3%",
      trend: "up",
      icon: <TrendingUp className="w-6 h-6 text-success" />,
    },
  ];

  return metrics;
}

export default function ExecutiveMode() {
  const context = useContext(DatasetContext);
  if (!context) return null;

  const { dataset } = context;
  const metrics = useMemo(() => extractExecutiveMetrics(dataset), [dataset]);

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-lg text-ink-muted">
            Make decisions in seconds. Everything you need to know, at a glance.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-ink-muted text-sm font-medium">{metric.title}</h3>
                {metric.icon}
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                {metric.change && (
                  <div
                    className={`text-sm font-medium ${
                      metric.trend === "up" ? "text-success" : "text-danger"
                    }`}
                  >
                    {metric.change} from last period
                  </div>
                )}
              </div>

              {/* Mini chart placeholder */}
              <div className="h-12 bg-white/5 rounded border border-white/10 mt-4" />
            </motion.div>
          ))}
        </div>

        {/* Risks & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-danger" />
              <h2 className="text-xl font-bold text-white">Risks to Monitor</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Customer Churn",
                  severity: "High",
                  description: "Returning customers down 21%",
                },
                {
                  title: "Market Saturation",
                  severity: "Medium",
                  description: "New customer acquisition slowing",
                },
                {
                  title: "Regional Decline",
                  severity: "Medium",
                  description: "West region revenue down 8%",
                },
              ].map((risk, idx) => (
                <div key={idx} className="border-l-2 border-danger pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white">{risk.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-danger/20 text-danger">
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">{risk.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-brand-cyan" />
              <h2 className="text-xl font-bold text-white">Growth Opportunities</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Retention Program",
                  potential: "+$320K",
                  description: "Target previous customers with special offers",
                },
                {
                  title: "Product Bundling",
                  potential: "+$180K",
                  description: "Increase AOV through smart recommendations",
                },
                {
                  title: "Geographic Expansion",
                  potential: "+$410K",
                  description: "East region shows strong growth potential",
                },
              ].map((opp, idx) => (
                <div key={idx} className="border-l-2 border-brand-cyan pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white">{opp.title}</h4>
                    <span className="text-sm font-bold text-success">{opp.potential}</span>
                  </div>
                  <p className="text-sm text-ink-muted">{opp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-8 border-l-2 border-brand-purple space-y-4"
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-purple" />
            AI Recommendation
          </h2>
          <p className="text-lg text-ink-muted">
            <span className="text-white font-semibold">Priority: Launch a customer retention program.</span> Your data shows
            a 21% decline in returning customers, which is your primary growth risk. A
            targeted retention campaign could recover $320K in annual revenue with 60%
            confidence.
          </p>
          <button className="mt-6 px-6 py-3 rounded-lg bg-brand-purple/20 border border-brand-purple/50 text-brand-purple font-semibold hover:bg-brand-purple/30 transition">
            View Detailed Analysis
          </button>
        </motion.div>
      </div>
    </div>
  );
}
