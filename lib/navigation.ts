import {
  Brain,
  Database,
  FileBarChart,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Wand2,
  BarChart3,
  BookOpen,
  Network,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export const DASHBOARD_NAV: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Executive snapshot of your dataset",
  },
  {
    label: "Datasets",
    href: "/dashboard/datasets",
    icon: Database,
    description: "Upload, inspect and switch datasets",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: LineChart,
    description: "Build charts from any two columns",
  },
  {
    label: "AI Insights",
    href: "/dashboard/insights",
    icon: Sparkles,
    description: "Findings, trends, anomalies, opportunities",
    badge: "AI",
  },
  {
    label: "Predictions",
    href: "/dashboard/predictions",
    icon: Brain,
    description: "Regression, classification and forecasting",
  },
  {
    label: "Data Quality",
    href: "/dashboard/quality",
    icon: ShieldCheck,
    description: "Score, issues and recommendations",
  },
  {
    label: "Data Cleaning",
    href: "/dashboard/cleaning",
    icon: Wand2,
    description: "Detect and fix problems automatically",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileBarChart,
    description: "Generate an executive-ready report",
  },
  {
    label: "Executive Mode",
    href: "/dashboard/executive",
    icon: BarChart3,
    description: "High-level business intelligence for decision makers",
  },
  {
    label: "Analyst Mode",
    href: "/dashboard/analyst",
    icon: Database,
    description: "Deep data investigation and statistical analysis",
  },
  {
    label: "Correlations",
    href: "/dashboard/correlations",
    icon: Network,
    description: "Explore relationships between variables",
  },
  {
    label: "Data Story",
    href: "/dashboard/story",
    icon: BookOpen,
    description: "Visual narrative of your data insights",
  },
  {
    label: "Interactive Demo",
    href: "/dashboard/demo",
    icon: Play,
    description: "See DataForge in action",
    badge: "NEW",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Preferences, AI engine and environment",
  },
];
