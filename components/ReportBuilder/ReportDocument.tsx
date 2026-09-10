import React from "react";
import type { ReportData } from "@/services/reportService";

interface ReportDocumentProps {
  data: ReportData;
  includeTableOfContents: boolean;
  pageNumbers: boolean;
  colorScheme: "professional" | "corporate" | "minimal";
}

export function ReportDocument({ data, includeTableOfContents, pageNumbers, colorScheme }: ReportDocumentProps) {
  const colors = {
    professional: { primary: "#1F2937", accent: "#3B82F6", text: "#111827" },
    corporate: { primary: "#0F172A", accent: "#1E40AF", text: "#000000" },
    minimal: { primary: "#000000", accent: "#000000", text: "#000000" },
  };

  const scheme = colors[colorScheme];

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: "#FFFFFF", color: scheme.text }}>
      {/* Cover Page */}
      <div
        style={{
          padding: "80px 60px",
          backgroundColor: scheme.primary,
          color: "#FFFFFF",
          textAlign: "center",
          pageBreakAfter: "always",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "20px" }}>{data.title}</h1>
        <p style={{ fontSize: "20px", marginBottom: "60px", opacity: 0.9 }}>{data.datasetName}</p>

        <div
          style={{
            borderTop: "2px solid rgba(255,255,255,0.3)",
            paddingTop: "60px",
            marginTop: "60px",
            width: "100%",
          }}
        >
          <p style={{ fontSize: "14px", opacity: 0.8 }}>Report Generated: {data.generatedDate.toLocaleDateString()}</p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>Data Quality Score: {data.qualityScore}%</p>
        </div>
      </div>

      {/* Table of Contents */}
      {includeTableOfContents && (
        <div
          style={{
            padding: "60px",
            pageBreakAfter: "always",
          }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px" }}>Table of Contents</h2>

          <div style={{ fontSize: "14px", lineHeight: "2", color: scheme.primary }}>
            <p>1. Executive Summary</p>
            <p>2. Dataset Overview</p>
            <p>3. Key Metrics</p>
            <p>4. Data Quality Assessment</p>
            <p>5. Key Insights</p>
            <p>6. Recommendations</p>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div style={{ padding: "60px", pageBreakAfter: "always" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "30px", color: scheme.primary }}>Executive Summary</h2>

        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", color: scheme.primary }}>Overview</h3>
          <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#4B5563" }}>{data.executiveSummary.overview}</p>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", color: scheme.primary }}>Key Findings</h3>
          <ul style={{ fontSize: "14px", lineHeight: "2", color: "#4B5563", marginLeft: "20px" }}>
            {data.executiveSummary.keyFindings.map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", color: scheme.primary }}>Recommendations</h3>
          <ul style={{ fontSize: "14px", lineHeight: "2", color: "#4B5563", marginLeft: "20px" }}>
            {data.executiveSummary.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "#EFF6FF",
            border: `2px solid ${scheme.accent}`,
            padding: "20px",
            borderRadius: "8px",
            marginTop: "40px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: "600", color: scheme.accent, marginBottom: "8px" }}>CONFIDENCE LEVEL</p>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#E5E7EB",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: scheme.accent,
                width: `${data.executiveSummary.confidence}%`,
              }}
            />
          </div>
          <p style={{ fontSize: "12px", color: scheme.primary, marginTop: "8px" }}>
            {data.executiveSummary.confidence}% Confidence
          </p>
        </div>
      </div>

      {/* Dataset Overview */}
      <div style={{ padding: "60px", pageBreakAfter: "always" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "30px", color: scheme.primary }}>Dataset Overview</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              border: "1px solid #E5E7EB",
              padding: "30px",
              borderRadius: "8px",
              backgroundColor: "#F9FAFB",
            }}
          >
            <p style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginBottom: "8px" }}>TOTAL RECORDS</p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: scheme.primary }}>
              {data.datasetRows.toLocaleString()}
            </p>
          </div>

          <div
            style={{
              border: "1px solid #E5E7EB",
              padding: "30px",
              borderRadius: "8px",
              backgroundColor: "#F9FAFB",
            }}
          >
            <p style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginBottom: "8px" }}>TOTAL COLUMNS</p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: scheme.primary }}>
              {data.datasetColumns}
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: scheme.primary }}>Key Metrics</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {data.keyMetrics.map((metric, idx) => (
            <div key={idx} style={{ border: "1px solid #E5E7EB", padding: "20px", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>{metric.label}</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: scheme.primary }}>{metric.value}</p>
              {metric.change && (
                <p style={{ fontSize: "12px", color: metric.trend === "up" ? "#10B981" : "#EF4444", marginTop: "8px" }}>
                  {metric.change} {metric.trend === "up" ? "↑" : "↓"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality */}
      <div style={{ padding: "60px", pageBreakAfter: "always" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "30px", color: scheme.primary }}>Data Quality Assessment</h2>

        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            padding: "40px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "10px", fontWeight: "600" }}>OVERALL QUALITY SCORE</p>
          <p style={{ fontSize: "48px", fontWeight: "700", color: scheme.accent }}>{data.qualityScore}%</p>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "10px" }}>
            {data.qualityScore > 80
              ? "Excellent data quality with minimal issues"
              : data.qualityScore > 60
                ? "Good data quality with some areas for improvement"
                : "Data quality needs improvement"}
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{ padding: "60px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "30px", color: scheme.primary }}>Key Insights</h2>

        <ul style={{ fontSize: "14px", lineHeight: "2.4", color: "#4B5563", marginLeft: "20px" }}>
          {data.insights.map((insight, idx) => (
            <li key={idx} style={{ marginBottom: "20px" }}>
              {insight}
            </li>
          ))}
        </ul>

        {pageNumbers && (
          <div
            style={{
              borderTop: "1px solid #E5E7EB",
              paddingTop: "20px",
              marginTop: "40px",
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: "12px",
            }}
          >
            Page 5 of 5 | Generated by DataForge AI
          </div>
        )}
      </div>
    </div>
  );
}
