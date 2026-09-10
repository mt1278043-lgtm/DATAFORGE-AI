"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  BarChart3,
  Brain,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionHref?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to DataForge AI",
    description:
      "Transform your data into actionable insights with our AI-powered analytics platform.",
    icon: <Brain className="w-12 h-12 text-brand-cyan" />,
  },
  {
    id: "upload",
    title: "Upload Your Dataset",
    description:
      "Start by uploading a CSV or Excel file. Our engine will analyze it automatically.",
    icon: <Upload className="w-12 h-12 text-brand-cyan" />,
    action: "Upload Dataset",
    actionHref: "/dashboard",
  },
  {
    id: "explore",
    title: "Explore Analytics",
    description:
      "Create beautiful charts and visualizations from any two columns in your data.",
    icon: <BarChart3 className="w-12 h-12 text-brand-cyan" />,
    action: "View Analytics",
    actionHref: "/dashboard/analytics",
  },
  {
    id: "insights",
    title: "Get AI Insights",
    description:
      "Let our machine learning detect patterns, trends, and opportunities automatically.",
    icon: <Brain className="w-12 h-12 text-brand-cyan" />,
    action: "View Insights",
    actionHref: "/dashboard/insights",
  },
  {
    id: "reports",
    title: "Generate Reports",
    description:
      "Create professional, AI-powered PDF reports ready for executives and stakeholders.",
    icon: <FileText className="w-12 h-12 text-brand-cyan" />,
    action: "Generate Report",
    actionHref: "/dashboard/reports",
  },
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingFlow({ isOpen, onClose }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] z-50 overflow-auto"
          >
            <div className="glass p-12 rounded-2xl mx-4 space-y-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition text-ink-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="flex justify-center"
                >
                  {step.icon}
                </motion.div>

                {/* Text */}
                <div className="space-y-3">
                  <h2 className="text-4xl font-bold text-white">{step.title}</h2>
                  <p className="text-lg text-ink-muted max-w-lg mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Feature List (for specific steps) */}
                {step.id === "welcome" && (
                  <div className="bg-white/5 rounded-lg p-6 space-y-3 text-left mt-8">
                    <h3 className="font-semibold text-white">What you can do:</h3>
                    <ul className="space-y-2 text-sm text-ink-muted">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Upload and analyze any dataset instantly</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Get AI-powered insights automatically</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Create professional reports in minutes</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Explore data with beautiful visualizations</span>
                      </li>
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>
                    Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex-1" />

                {step.actionHref ? (
                  <a
                    href={step.actionHref}
                    className="px-6 py-3 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-bold transition flex items-center gap-2"
                    onClick={handleNext}
                  >
                    {step.action}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-bold transition flex items-center gap-2"
                  >
                    {currentStep === ONBOARDING_STEPS.length - 1
                      ? "Get Started"
                      : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Skip Button */}
              <button
                onClick={onClose}
                className="w-full text-sm text-ink-muted hover:text-white transition"
              >
                Skip Onboarding
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
