import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Showcase } from "@/components/landing/Showcase";
import {
  AnalyticsVisual,
  InsightsVisual,
  PredictionsVisual,
} from "@/components/landing/ShowcaseVisuals";

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />

        <Showcase
          id="analytics"
          eyebrow="Analytics"
          title="Build the chart you need, not the one the tool offers"
          description="Choose any column for X, any measure for Y, pick an aggregation and a chart type. The workspace rebuilds instantly from your real rows - no modelling layer, no query language."
          bullets={[
            "Line, bar, area, pie and scatter, all from one control set",
            "Automatic date bucketing and top-N grouping with an 'Other' bucket",
            "Export any chart's underlying data as CSV, or open it fullscreen",
          ]}
          visual={<AnalyticsVisual />}
          cta={{ label: "Open the analytics workspace", href: "/dashboard/analytics" }}
        />

        <Showcase
          id="ai-insights"
          eyebrow="AI Insights"
          title="Findings that cite their own evidence"
          description="Seven detectors run across your dataset looking for direction, concentration, correlation, anomalies and efficiency gaps. Every statistic shown is computed from your data, and each card lists the evidence behind it."
          bullets={[
            "Trends measured by comparing the opening and closing thirds of the period",
            "Anomalies flagged by z-score and interquartile range, not by guesswork",
            "An assistant that answers questions against the profile, never inventing numbers",
          ]}
          visual={<InsightsVisual />}
          reversed
          cta={{ label: "See AI insights", href: "/dashboard/insights" }}
        />

        <Showcase
          id="predictions"
          eyebrow="Predictions"
          title="Forecasts that are honest about their limits"
          description="Fit a regression against any driver, score class probabilities, or project the next periods with confidence bands that widen as the horizon grows. Simulated results are labelled as simulated."
          bullets={[
            "Ordinary least squares with R squared, RMSE and MAE reported",
            "Class priors and conditional means for categorical targets",
            "Trend forecasting with a 95% band derived from residual volatility",
          ]}
          visual={<PredictionsVisual />}
          cta={{ label: "Run a prediction", href: "/dashboard/predictions" }}
        />

        <Features />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
