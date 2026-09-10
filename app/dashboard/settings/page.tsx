"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Lock,
  Zap,
  Database,
  Upload,
  Eye,
  Moon,
  Monitor,
  Save,
  RotateCw,
} from "lucide-react";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "general",
    label: "General",
    icon: <Settings className="w-5 h-5" />,
    description: "Basic app settings",
  },
  {
    id: "ai",
    label: "AI Engine",
    icon: <Zap className="w-5 h-5" />,
    description: "AI model configuration",
  },
  {
    id: "data",
    label: "Data & Privacy",
    icon: <Database className="w-5 h-5" />,
    description: "Data handling preferences",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-5 h-5" />,
    description: "Alert preferences",
  },
  {
    id: "display",
    label: "Display",
    icon: <Eye className="w-5 h-5" />,
    description: "Visual preferences",
  },
  {
    id: "security",
    label: "Security",
    icon: <Lock className="w-5 h-5" />,
    description: "Security settings",
  },
];

interface Settings {
  general: {
    appName: string;
    autoSave: boolean;
    dataRetention: "30days" | "90days" | "1year" | "forever";
  };
  ai: {
    engine: "openai" | "local";
    confidenceThreshold: number;
    enableAutoInsights: boolean;
    detailedAnalysis: boolean;
  };
  data: {
    allowDataCollection: boolean;
    allowAnalytics: boolean;
    exportFormat: "json" | "csv" | "both";
  };
  notifications: {
    emailNotifications: boolean;
    insightAlerts: boolean;
    analysisComplete: boolean;
  };
  display: {
    theme: "light" | "dark" | "system";
    compact: boolean;
    animations: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    dataEncryption: boolean;
  };
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>("general");
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    general: {
      appName: "DataForge AI",
      autoSave: true,
      dataRetention: "1year",
    },
    ai: {
      engine: "local",
      confidenceThreshold: 75,
      enableAutoInsights: true,
      detailedAnalysis: true,
    },
    data: {
      allowDataCollection: true,
      allowAnalytics: true,
      exportFormat: "both",
    },
    notifications: {
      emailNotifications: true,
      insightAlerts: true,
      analysisComplete: true,
    },
    display: {
      theme: "dark",
      compact: false,
      animations: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      dataEncryption: true,
    },
  });

  const handleSettingChange = (section: keyof Settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // TODO: Save settings to backend
  };

  const handleReset = () => {
    setHasChanges(false);
    // TODO: Reset to saved settings
  };

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="text-lg text-ink-muted">Customize your DataForge experience</p>
        </motion.div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {SETTINGS_SECTIONS.map((section, idx) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeSection === section.id
                    ? "bg-brand-cyan/20 border border-brand-cyan/50 text-white"
                    : "hover:bg-white/10 text-ink-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={activeSection === section.id ? "text-brand-cyan" : ""}>
                    {section.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className="text-xs opacity-70">{section.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">App Name</span>
                        <input
                          type="text"
                          value={settings.general.appName}
                          onChange={(e) =>
                            handleSettingChange("general", "appName", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-brand-cyan focus:outline-none"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.autoSave}
                          onChange={(e) =>
                            handleSettingChange("general", "autoSave", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Auto-save Changes</span>
                      </label>
                      <p className="text-xs text-ink-muted mt-1 ml-8">
                        Automatically save changes without confirmation
                      </p>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">
                          Data Retention Policy
                        </span>
                        <select
                          value={settings.general.dataRetention}
                          onChange={(e) =>
                            handleSettingChange("general", "dataRetention", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-brand-cyan focus:outline-none"
                        >
                          <option value="30days">30 Days</option>
                          <option value="90days">90 Days</option>
                          <option value="1year">1 Year</option>
                          <option value="forever">Forever</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Engine Settings */}
            {activeSection === "ai" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">AI Engine Configuration</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">AI Engine</span>
                        <select
                          value={settings.ai.engine}
                          onChange={(e) => handleSettingChange("ai", "engine", e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-brand-cyan focus:outline-none"
                        >
                          <option value="local">Local (Default)</option>
                          <option value="openai">OpenAI GPT-4</option>
                        </select>
                        <p className="text-xs text-ink-muted mt-2">
                          Local mode works offline. OpenAI mode requires API key.
                        </p>
                      </label>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">
                          Confidence Threshold: {settings.ai.confidenceThreshold}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.ai.confidenceThreshold}
                          onChange={(e) =>
                            handleSettingChange(
                              "ai",
                              "confidenceThreshold",
                              Number(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-ink-muted mt-2">
                          Only show insights with confidence above this threshold
                        </p>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.ai.enableAutoInsights}
                          onChange={(e) =>
                            handleSettingChange("ai", "enableAutoInsights", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Auto-generate Insights</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.ai.detailedAnalysis}
                          onChange={(e) =>
                            handleSettingChange("ai", "detailedAnalysis", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Enable Detailed Analysis</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Display Settings */}
            {activeSection === "display" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Display Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">Theme</span>
                        <div className="grid grid-cols-3 gap-3">
                          {(
                            [
                              { value: "light", label: "Light", icon: null },
                              { value: "dark", label: "Dark", icon: null },
                              { value: "system", label: "System", icon: null },
                            ] as const
                          ).map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() => handleSettingChange("display", "theme", theme.value)}
                              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                                settings.display.theme === theme.value
                                  ? "border-brand-cyan bg-brand-cyan/10 text-white"
                                  : "border-white/10 text-ink-muted hover:border-white/20"
                              }`}
                            >
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.compact}
                          onChange={(e) =>
                            handleSettingChange("display", "compact", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Compact View</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.display.animations}
                          onChange={(e) =>
                            handleSettingChange("display", "animations", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Enable Animations</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg p-4">
                      <p className="text-sm text-brand-cyan">
                        <strong>Data Encryption:</strong> Your data is encrypted at rest and in transit
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) =>
                            handleSettingChange("security", "twoFactorAuth", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">Two-Factor Authentication</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.dataEncryption}
                          onChange={(e) =>
                            handleSettingChange("security", "dataEncryption", e.target.checked)
                          }
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-white font-medium">End-to-End Encryption</span>
                      </label>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-white mb-2 block">
                          Session Timeout (minutes)
                        </span>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) =>
                            handleSettingChange(
                              "security",
                              "sessionTimeout",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-brand-cyan focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Default Content for other sections */}
            {!["general", "ai", "display", "security"].includes(activeSection) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 text-center py-16"
              >
                <p className="text-ink-muted">
                  Settings for this section coming soon...
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Reset
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-6 py-3 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/50 text-brand-cyan font-bold transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
