"use client";

import { useRouter } from "next/navigation";
import { Database, Download, RotateCcw } from "lucide-react";

import { DataTable } from "@/components/data/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DatasetSummary } from "@/components/upload/DatasetSummary";
import { Dropzone } from "@/components/upload/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useDataset } from "@/hooks/useDataset";
import { useToast } from "@/hooks/useToast";
import { downloadBlob } from "@/lib/utils";
import { datasetToCsv } from "@/services/fileParser";

export default function DatasetsPage() {
  const { dataset, isDemo, resetToDemo } = useDataset();
  const router = useRouter();
  const toast = useToast();

  const exportCsv = () => {
    downloadBlob(
      datasetToCsv(dataset),
      dataset.meta.name.replace(/\.[a-z]+$/i, "") + ".csv",
      "text/csv;charset=utf-8;",
    );
    toast.success("Dataset exported", `${dataset.rowCount.toLocaleString()} rows saved as CSV.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Datasets"
        title="Load and inspect your data"
        description="Upload a CSV or Excel file. Everything is parsed and profiled in your browser - no data leaves this device unless you use the OpenAI assistant."
        actions={
          <>
            {!isDemo ? (
              <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetToDemo}>
                Restore demo
              </Button>
            ) : null}
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={exportCsv}>
              Export CSV
            </Button>
          </>
        }
      />

      <Card highlight>
        <CardHeader
          icon={<Database className="h-4 w-4" />}
          title="Upload a dataset"
          description="CSV, XLS and XLSX are supported. Large files are capped at 50,000 rows to keep the workspace responsive."
        />
        <CardBody>
          <Dropzone onLoaded={() => router.refresh()} />
        </CardBody>
      </Card>

      <DatasetSummary dataset={dataset} onAnalyze={() => router.push("/dashboard/analytics")} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Data preview</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Search, sort and page through every row. Only the visible page is rendered.
            </p>
          </div>
        </div>
        <DataTable dataset={dataset} />
      </section>
    </>
  );
}
