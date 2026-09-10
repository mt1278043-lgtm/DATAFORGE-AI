"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { CHART_COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { ChartPoint, ChartType } from "@/types";

interface ChartRendererProps {
  data: ChartPoint[];
  type: ChartType;
  height?: number;
  yLabel?: string;
  xLabel?: string;
  animate?: boolean;
}

const AXIS_STYLE = { fill: "#6C7A9C", fontSize: 11 } as const;
const GRID_STROKE = "rgba(255,255,255,0.06)";

function truncate(value: string, max = 14): string {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

/**
 * Single entry point for every chart type in the product, so styling,
 * animation timing and tooltips stay identical everywhere.
 */
export function ChartRenderer({
  data,
  type,
  height = 320,
  yLabel = "Value",
  xLabel,
  animate = true,
}: ChartRendererProps) {
  const gradientId = useMemo(() => `grad-${Math.random().toString(36).slice(2, 8)}`, []);
  const duration = animate ? 900 : 0;

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-white/10 text-[13px] text-ink-faint"
        style={{ height }}
      >
        No data available for this combination.
      </div>
    );
  }

  const commonAxes = (
    <>
      <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 6" vertical={false} />
      <XAxis
        dataKey="label"
        tick={AXIS_STYLE}
        tickLine={false}
        axisLine={{ stroke: GRID_STROKE }}
        tickFormatter={(value: string) => truncate(String(value))}
        minTickGap={18}
        label={
          xLabel
            ? { value: xLabel, position: "insideBottom", offset: -6, fill: "#4E5B7A", fontSize: 11 }
            : undefined
        }
      />
      <YAxis
        tick={AXIS_STYLE}
        tickLine={false}
        axisLine={false}
        width={62}
        tickFormatter={(value: number) => formatNumber(value, { compact: true })}
      />
      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "line" ? (
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: xLabel ? 16 : 0 }}>
          {commonAxes}
          <Line
            type="monotone"
            dataKey="value"
            name={yLabel}
            stroke="#22D3EE"
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#8B5CF6" }}
            animationDuration={duration}
          />
        </LineChart>
      ) : type === "area" ? (
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: xLabel ? 16 : 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.55} />
              <stop offset="55%" stopColor="#22D3EE" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
          </defs>
          {commonAxes}
          <Area
            type="monotone"
            dataKey="value"
            name={yLabel}
            stroke="#22D3EE"
            strokeWidth={2.2}
            fill={`url(#${gradientId})`}
            animationDuration={duration}
          />
        </AreaChart>
      ) : type === "bar" ? (
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: xLabel ? 16 : 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          {commonAxes}
          <Bar
            dataKey="value"
            name={yLabel}
            fill={`url(#${gradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
            animationDuration={duration}
          />
        </BarChart>
      ) : type === "pie" ? (
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: "#96A2C0", fontSize: 12 }}>{truncate(value, 18)}</span>
            )}
          />
          <Pie
            data={data.slice(0, 10)}
            dataKey="value"
            nameKey="label"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={3}
            stroke="rgba(5,7,13,0.9)"
            strokeWidth={2}
            animationDuration={duration}
          >
            {data.slice(0, 10).map((entry, index) => (
              <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      ) : (
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: xLabel ? 16 : 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 6" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel ?? "X"}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
            tickFormatter={(value: number) => formatNumber(value, { compact: true })}
          />
          <YAxis
            type="number"
            dataKey="value"
            name={yLabel}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={(value: number) => formatNumber(value, { compact: true })}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "4 4" }} />
          <Scatter data={data} fill="#8B5CF6" animationDuration={duration} shape="circle" />
        </ScatterChart>
      )}
    </ResponsiveContainer>
  );
}
