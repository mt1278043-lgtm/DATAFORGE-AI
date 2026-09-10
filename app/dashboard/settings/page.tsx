"use client";

import { KeyRound, RotateCcw, Server, Settings as SettingsIcon, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useAiStatus } from "@/hooks/useAiStatus";
import { useDataset } from "@/hooks/useDataset";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/useToast";
import { LIMITS } from "@/lib/constants";
import { formatBytes } from "@/lib/format";

const ENV_VARS = [
  {
    name: "OPENAI_API_KEY",
    description: "Server-side key for the AI assistant and narratives. Empty enables demo mode.",
    required: false,
  },
  {
    name: "OPENAI_MODEL",
    description: "Overrides the default model (gpt-4o-mini).",
    required: false,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Reserved for dataset persistence in a future release.",
    required: false,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Reserved for dataset persistence in a future release.",
    required: false,
  },
];

export default function SettingsPage() {
  const { status, loading } = useAiStatus();
  const { dataset, resetToDemo } = useDataset();
  const toast = useToast();

  const [animations, setAnimations] = useLocalStorage("df.animations", true);
  const [compactTables, setCompactTables] = useLocalStorage("df.compactTables", false);
  const [autoInsights, setAutoInsights] = useLocalStorage("df.autoInsights", true);
  const [notifications, setNotifications] = useLocalStorage("df.notifications", true);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Configure the AI engine, workspace preferences and the environment this instance is running with."
      />

      <section className="grid gap-5 xl:grid-cols-2">
        {/* AI engine ------------------------------------------------------- */}
        <Card highlight>
          <CardHeader
            icon={<Sparkles className="h-4 w-4" />}
            title="AI engine"
            description="How DataForge answers questions and writes narratives"
            actions={
              <Badge tone={status.mode === "openai" ? "success" : "violet"} dot pulse>
                {loading ? "Checking..." : status.label}
              </Badge>
            }
          />
          <CardBody className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-ink">Active provider</p>
                <span className="text-[13px] text-ink-muted">
                  {status.mode === "openai" ? "OpenAI" : "Local demo engine"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[13px] font-medium text-ink">Model</p>
                <span className="font-mono text-[12.5px] text-brand-cyan">
                  {status.model ?? "deterministic-analyst-v1"}
                </span>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-ink-muted">
              {status.mode === "openai"
                ? "An OpenAI key is configured on the server. Questions are answered with your dataset profile as context - the raw rows never leave your browser, and the key is never sent to the client."
                : "No OpenAI key is configured, so DataForge runs its built-in analyst. Every answer is computed from your dataset profile. Add OPENAI_API_KEY to .env.local and restart the dev server to enable open-ended conversation."}
            </p>

            <div className="flex items-start gap-3 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/[0.05] p-4">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              <p className="text-[12.5px] leading-relaxed text-ink-muted">
                Keys are read server-side only, inside route handlers. Never place a secret in a
                variable prefixed with <span className="font-mono text-brand-cyan">NEXT_PUBLIC_</span> -
                those are inlined into the browser bundle.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Preferences ----------------------------------------------------- */}
        <Card>
          <CardHeader
            icon={<SettingsIcon className="h-4 w-4" />}
            title="Preferences"
            description="Stored locally in this browser"
          />
          <CardBody className="space-y-5">
            <Switch
              checked={animations}
              onChange={setAnimations}
              label="Interface animations"
              description="Page transitions, chart reveals and hover motion."
            />
            <div className="divider" />
            <Switch
              checked={compactTables}
              onChange={setCompactTables}
              label="Compact tables"
              description="Tighter row height in the data preview."
            />
            <div className="divider" />
            <Switch
              checked={autoInsights}
              onChange={setAutoInsights}
              label="Generate insights on upload"
              description="Run the detector suite as soon as a dataset is profiled."
            />
            <div className="divider" />
            <Switch
              checked={notifications}
              onChange={setNotifications}
              label="Toast notifications"
              description="Confirmations for uploads, exports and cleaning."
            />
          </CardBody>
        </Card>

        {/* Environment ----------------------------------------------------- */}
        <Card>
          <CardHeader
            icon={<Server className="h-4 w-4" />}
            title="Environment"
            description="Variables read from .env.local"
          />
          <CardBody className="space-y-3">
            {ENV_VARS.map((variable) => (
              <div
                key={variable.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[12.5px] text-ink">{variable.name}</span>
                  <Badge tone={variable.required ? "warning" : "neutral"}>
                    {variable.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
                  {variable.description}
                </p>
              </div>
            ))}
            <p className="text-[12px] text-ink-faint">
              Values are never displayed here - only whether the AI engine resolved to OpenAI or demo
              mode.
            </p>
          </CardBody>
        </Card>

        {/* Workspace ------------------------------------------------------- */}
        <Card>
          <CardHeader
            icon={<RotateCcw className="h-4 w-4" />}
            title="Workspace"
            description="Current session and limits"
          />
          <CardBody className="space-y-4">
            <dl className="grid grid-cols-2 gap-4">
              {[
                { label: "Active dataset", value: dataset.meta.name },
                { label: "Source", value: dataset.meta.source === "demo" ? "Demo" : "Uploaded" },
                { label: "Rows in memory", value: dataset.rowCount.toLocaleString() },
                { label: "Columns", value: String(dataset.columnCount) },
                { label: "Max upload size", value: formatBytes(LIMITS.maxFileSizeBytes) },
                { label: "Row cap", value: LIMITS.maxRowsInMemory.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    {item.label}
                  </dt>
                  <dd className="mt-1 truncate text-[13.5px] text-ink" title={item.value}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="divider" />

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="secondary"
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={resetToDemo}
              >
                Restore demo dataset
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast.info("Nothing to clear", "Datasets live only in this session.")}
              >
                Clear session data
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
