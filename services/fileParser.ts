import Papa from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";

import { ACCEPTED_FILE_TYPES, LIMITS } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { uid } from "@/lib/utils";
import { buildDataset } from "@/services/profiler";
import type { Dataset, DatasetMeta, DatasetRow, SupportedFileType } from "@/types";

/** Recoverable, user-presentable parsing failure. */
export class FileParseError extends Error {
  readonly code: ParseErrorCode;

  constructor(code: ParseErrorCode, message: string) {
    super(message);
    this.name = "FileParseError";
    this.code = code;
  }
}

export type ParseErrorCode =
  | "unsupported-type"
  | "too-large"
  | "empty"
  | "no-columns"
  | "corrupted"
  | "unknown";

export const fileMetaSchema = z.object({
  name: z.string().min(1, "The file needs a name."),
  size: z
    .number()
    .positive("This file appears to be empty.")
    .max(LIMITS.maxFileSizeBytes, `Files must be under ${formatBytes(LIMITS.maxFileSizeBytes)}.`),
});

export function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function isSupportedFile(file: File): boolean {
  return (ACCEPTED_FILE_TYPES as string[]).includes(getFileExtension(file.name));
}

/** Normalizes header names: trims, de-duplicates and replaces empties. */
function normalizeHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((header, index) => {
    const base = String(header ?? "").trim() || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

function rowsFromMatrix(matrix: unknown[][]): DatasetRow[] {
  if (matrix.length === 0) return [];
  const headerRowIndex = matrix.findIndex((row) =>
    row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ""),
  );
  if (headerRowIndex === -1) return [];

  const headers = normalizeHeaders(matrix[headerRowIndex].map((h) => String(h ?? "")));
  const body = matrix.slice(headerRowIndex + 1);
  const rows: DatasetRow[] = [];

  for (const raw of body) {
    if (!raw || raw.every((cell) => cell === null || cell === undefined || cell === "")) continue;
    const row: DatasetRow = {};
    headers.forEach((header, index) => {
      const value = raw[index];
      if (value === undefined || value === null) row[header] = null;
      else if (typeof value === "number" || typeof value === "boolean") row[header] = value;
      else if (value instanceof Date) row[header] = value.toISOString().slice(0, 10);
      else row[header] = String(value);
    });
    rows.push(row);
    if (rows.length >= LIMITS.maxRowsInMemory) break;
  }

  return rows;
}

async function parseCsv(file: File): Promise<DatasetRow[]> {
  const text = await file.text();
  if (text.trim() === "") throw new FileParseError("empty", "That CSV file has no content.");

  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    header: false,
  });

  const fatal = result.errors.find((e) => e.type === "Delimiter" || e.code === "UndetectableDelimiter");
  if (fatal && result.data.length === 0) {
    throw new FileParseError("corrupted", "We could not detect a delimiter in that CSV file.");
  }

  return rowsFromMatrix(result.data as unknown[][]);
}

async function parseExcel(file: File): Promise<{ rows: DatasetRow[]; sheetName: string }> {
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    throw new FileParseError("corrupted", "That spreadsheet could not be opened. It may be corrupted.");
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new FileParseError("empty", "That workbook has no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });

  return { rows: rowsFromMatrix(matrix as unknown[][]), sheetName };
}

/**
 * Parses a user-supplied CSV/XLS/XLSX file into a fully profiled Dataset.
 * Throws `FileParseError` with a friendly message for every failure path.
 */
export async function parseFile(file: File): Promise<Dataset> {
  const meta = fileMetaSchema.safeParse({ name: file.name, size: file.size });
  if (!meta.success) {
    const issue = meta.error.issues[0];
    throw new FileParseError(file.size > LIMITS.maxFileSizeBytes ? "too-large" : "empty", issue.message);
  }

  const extension = getFileExtension(file.name) as SupportedFileType;
  if (!(ACCEPTED_FILE_TYPES as string[]).includes(extension)) {
    throw new FileParseError(
      "unsupported-type",
      `"${extension || "unknown"}" files are not supported. Upload a CSV, XLS or XLSX file.`,
    );
  }

  let rows: DatasetRow[] = [];
  let sheetName: string | undefined;

  try {
    if (extension === "csv") {
      rows = await parseCsv(file);
    } else {
      const parsed = await parseExcel(file);
      rows = parsed.rows;
      sheetName = parsed.sheetName;
    }
  } catch (error) {
    if (error instanceof FileParseError) throw error;
    throw new FileParseError("unknown", "Something went wrong while reading that file.");
  }

  if (rows.length === 0) {
    throw new FileParseError("empty", "We found no data rows in that file.");
  }
  if (Object.keys(rows[0]).length === 0) {
    throw new FileParseError("no-columns", "We could not detect any columns in that file.");
  }

  const datasetMeta: DatasetMeta = {
    id: uid("ds"),
    name: file.name,
    source: "upload",
    fileType: extension,
    sizeBytes: file.size,
    createdAt: new Date().toISOString(),
    sheetName,
  };

  return buildDataset(rows, datasetMeta);
}

/** Serializes a dataset back to CSV (used by exports and cleaned downloads). */
export function datasetToCsv(dataset: Dataset): string {
  const headers = dataset.columns.map((c) => c.name);
  return Papa.unparse({
    fields: headers,
    data: dataset.rows.map((row) => headers.map((h) => row[h] ?? "")),
  });
}
