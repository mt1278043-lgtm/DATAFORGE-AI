"use client";

import { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DatasetContext } from "@/hooks/useDataset";

interface CorrelationPair {
  var1: string;
  var2: string;
  correlation: number;
  strength: "strong" | "moderate" | "weak";
  relationship: string;
}

// Simulate correlation calculation
function calculateCorrelations(dataset: any): CorrelationPair[] {
  const numeric = dataset.columns.filter((c: any) => c.type === "numeric");

  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < numeric.length; i++) {
    for (let j = i + 1; j < numeric.length; j++) {
      const correlation = (Math.random() * 2 - 1).toFixed(2);
      const abs = Math.abs(parseFloat(correlation));

      pairs.push({
        var1: numeric[i].name,
        var2: numeric[j].name,
        correlation: parseFloat(correlation),
        strength:
          abs > 0.7 ? "strong" : abs > 0.4 ? "moderate" : ("weak" as const),
        relationship:
          abs > 0.7
            ? `${parseFloat(correlation) > 0 ? "Strong positive" : "Strong negative"} relationship`
            : abs > 0.4
              ? `Moderate ${parseFloat(correlation) > 0 ? "positive" : "negative"} relationship`
              : `Weak relationship`,
      });
    }
  }

  return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

export default function CorrelationExplorer() {
  const context = useContext(DatasetContext);
  if (!context) return null;

  const { dataset } = context;
  const [selectedPair, setSelectedPair] = useState<CorrelationPair | null>(null);
  const [filterStrength, setFilterStrength] = useState<"all" | "strong" | "moderate" | "weak">(
    "all"
  );

  const correlations = useMemo(() => calculateCorrelations(dataset), [dataset]);

  const filtered =
    filterStrength === "all"
      ? correlations
      : correlations.filter((p) => p.strength === filterStrength);

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Correlation Explorer</h1>
          <p className="text-lg text-ink-muted">
            Discover relationships between variables in your dataset.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 flex-wrap">
          {[
            { value: "all", label: "All Correlations", count: correlations.length },
            {
              value: "strong",
              label: "Strong",
              count: correlations.filter((p) => p.strength === "strong").length,
            },
            {
              value: "moderate",
              label: "Moderate",
              count: correlations.filter((p) => p.strength === "moderate").length,
            },
            {
              value: "weak",
              label: "Weak",
              count: correlations.filter((p) => p.strength === "weak").length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() =>
                setFilterStrength(tab.value as "all" | "strong" | "moderate" | "weak")
              }
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStrength === tab.value
                  ? "bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan"
                  : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Correlation Matrix */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.map((pair, idx) => (
              <motion.div
                key={`${pair.var1}-${pair.var2}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedPair(pair)}
                whileHover={{ scale: 1.02 }}
                className={`glass p-6 cursor-pointer transition ${
                  selectedPair?.var1 === pair.var1 && selectedPair?.var2 === pair.var2
                    ? "border-brand-cyan"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-4">
                  {/* Variable names */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">{pair.var1}</h3>
                      <p className="text-sm text-ink-muted">with {pair.var2}</p>
                    </div>

                    {/* Correlation coefficient */}
                    <div
                      className={`text-3xl font-bold ${
                        pair.correlation > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {pair.correlation > 0 ? "+" : ""}
                      {pair.correlation.toFixed(2)}
                    </div>
                  </div>

                  {/* Correlation bar */}
                  <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className={`h-full ${
                          pair.correlation > 0
                            ? "bg-gradient-to-r from-success to-brand-cyan"
                            : "bg-gradient-to-r from-danger to-brand-pink"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>-1.0</span>
                      <span>Correlation</span>
                      <span>+1.0</span>
                    </div>
                  </div>

                  {/* Description and strength */}
                  <div>
                    <p className="text-sm text-white">{pair.relationship}</p>
                    <span
                      className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                        pair.strength === "strong"
                          ? "bg-success/20 text-success"
                          : pair.strength === "moderate"
                            ? "bg-brand-cyan/20 text-brand-cyan"
                            : "bg-ink-faint/20 text-ink-muted"
                      }`}
                    >
                      {pair.strength.charAt(0).toUpperCase() + pair.strength.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Details Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 h-fit sticky top-8 space-y-6"
          >
            {selectedPair ? (
              <>
                <h3 className="text-2xl font-bold text-white">
                  {selectedPair.var1} vs {selectedPair.var2}
                </h3>

                <div className="space-y-4">
                  {/* Correlation value */}
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-xs text-ink-muted mb-1">Correlation Coefficient</div>
                    <div
                      className={`text-4xl font-bold ${
                        selectedPair.correlation > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {selectedPair.correlation > 0 ? "+" : ""}
                      {selectedPair.correlation.toFixed(3)}
                    </div>
                  </div>

                  {/* Relationship explanation */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Relationship</h4>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {selectedPair.relationship}. This suggests that when{" "}
                      <span className="text-white font-medium">{selectedPair.var1}</span>{" "}
                      {selectedPair.correlation > 0 ? "increases" : "decreases"}, there is a
                      tendency for{" "}
                      <span className="text-white font-medium">{selectedPair.var2}</span> to{" "}
                      {selectedPair.correlation > 0 ? "increase" : "decrease"} as well.
                    </p>
                  </div>

                  {/* Interpretation */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">What This Means</h4>
                    <ul className="text-sm text-ink-muted space-y-2">
                      <li className="flex gap-2">
                        <span className="text-brand-cyan">→</span>
                        <span>
                          {selectedPair.strength === "strong"
                            ? "Strong relationship - highly predictive"
                            : selectedPair.strength === "moderate"
                              ? "Moderate relationship - somewhat predictive"
                              : "Weak relationship - low predictive value"}
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-brand-cyan">→</span>
                        <span>
                          {selectedPair.correlation > 0
                            ? "Positive correlation - variables move together"
                            : "Negative correlation - variables move oppositely"}
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-brand-cyan">→</span>
                        <span>Consider this for modeling and forecasting</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button className="w-full px-4 py-3 rounded-lg bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan font-semibold hover:bg-brand-cyan/30 transition">
                  View Scatter Plot
                </button>
              </>
            ) : (
              <div className="text-center py-12 text-ink-muted">
                <p>Select a correlation pair to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
