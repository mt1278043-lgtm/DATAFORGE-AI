import { seededRandom } from "@/lib/utils";
import { buildDataset } from "@/services/profiler";
import type { Dataset, DatasetMeta, DatasetRow } from "@/types";

/**
 * Deterministic e-commerce demo dataset.
 *
 * The generator encodes real relationships so every insight, chart and
 * prediction produced from it is genuinely derived from the numbers:
 *  - Marketing spend drives orders with diminishing returns
 *  - Conversion rate follows spend efficiency, not randomness
 *  - Revenue = orders x category average order value x seasonality
 *  - Returning-customer share erodes slowly across the period
 *  - A small share of cells is intentionally missing/duplicated so the
 *    Data Quality and Cleaning modules have real work to do.
 */

const PRODUCTS = [
  { name: "Aurora Headset", category: "Electronics", aov: 189, appeal: 1.18 },
  { name: "Nova Smartwatch", category: "Electronics", aov: 249, appeal: 1.06 },
  { name: "Pulse Earbuds", category: "Electronics", aov: 129, appeal: 0.98 },
  { name: "Vertex Backpack", category: "Accessories", aov: 89, appeal: 0.92 },
  { name: "Halo Desk Lamp", category: "Home", aov: 64, appeal: 0.86 },
  { name: "Terra Water Bottle", category: "Home", aov: 32, appeal: 0.78 },
  { name: "Lumen Keyboard", category: "Electronics", aov: 149, appeal: 1.02 },
  { name: "Atlas Sneakers", category: "Apparel", aov: 119, appeal: 0.95 },
];

const REGIONS = [
  { name: "North America", weight: 1.25 },
  { name: "Europe", weight: 1.05 },
  { name: "Asia Pacific", weight: 0.92 },
  { name: "Middle East", weight: 0.68 },
  { name: "Latin America", weight: 0.6 },
];

const DAYS = 180;
const START = new Date("2025-04-01T00:00:00Z");

function isoDate(offsetDays: number): string {
  const date = new Date(START.getTime() + offsetDays * 86_400_000);
  return date.toISOString().slice(0, 10);
}

export function generateDemoRows(seed = 20250401): DatasetRow[] {
  const random = seededRandom(seed);
  const rows: DatasetRow[] = [];

  for (let day = 0; day < DAYS; day += 1) {
    const date = new Date(START.getTime() + day * 86_400_000);
    const weekday = date.getUTCDay();

    // Weekly rhythm + a gentle upward growth trend + a mid-period promo spike.
    const weekendLift = weekday === 0 || weekday === 6 ? 1.16 : 1;
    const growth = 1 + day * 0.0032;
    const promo = day >= 58 && day <= 66 ? 1.28 : 1;
    const seasonality = weekendLift * growth * promo;

    // Each day covers a rotating subset of products/regions to keep the
    // dataset realistically uneven rather than a perfect grid.
    const productCount = 4 + Math.floor(random() * 4);
    const startIndex = Math.floor(random() * PRODUCTS.length);

    for (let p = 0; p < productCount; p += 1) {
      const product = PRODUCTS[(startIndex + p) % PRODUCTS.length];
      const region = REGIONS[Math.floor(random() * REGIONS.length)];

      const baseSpend = 380 + random() * 720;
      const marketingSpend = baseSpend * seasonality * region.weight * product.appeal;

      // Diminishing-returns response curve: orders scale with sqrt(spend).
      const efficiency = 0.62 + random() * 0.16;
      const orders = Math.max(
        3,
        Math.round(Math.sqrt(marketingSpend) * efficiency * product.appeal * seasonality),
      );

      // Sessions imply a conversion rate that tracks spend efficiency.
      const sessions = Math.round((orders / (0.021 + efficiency * 0.018)) * (0.95 + random() * 0.12));
      const conversionRate = Number(((orders / sessions) * 100).toFixed(2));

      // Returning-customer share erodes over the period (a real, findable signal).
      const repeatShare = 0.34 - day * 0.00085 + (random() - 0.5) * 0.03;
      const customers = Math.max(2, Math.round(orders * (1 - Math.max(0.08, repeatShare))));

      const unitPrice = product.aov * (0.92 + random() * 0.18);
      const revenue = Number((orders * unitPrice).toFixed(2));

      rows.push({
        Date: isoDate(day),
        Product: product.name,
        Category: product.category,
        Revenue: revenue,
        Orders: orders,
        Customers: customers,
        Region: region.name,
        "Marketing Spend": Number(marketingSpend.toFixed(2)),
        "Conversion Rate": conversionRate,
      });
    }
  }

  return injectImperfections(rows, seededRandom(seed + 7));
}

/**
 * Real datasets are never pristine. We add a small, deterministic amount of
 * noise so quality scoring, cleaning and anomaly detection are demonstrable.
 */
function injectImperfections(rows: DatasetRow[], random: () => number): DatasetRow[] {
  const output = rows.map((row) => ({ ...row }));
  const nullableColumns = ["Customers", "Region", "Marketing Spend", "Conversion Rate"];

  // Optional fields are incomplete for roughly 1 in 8 rows.
  const missingCount = Math.floor(output.length * 0.5);
  for (let i = 0; i < missingCount; i += 1) {
    const index = Math.floor(random() * output.length);
    const column = nullableColumns[Math.floor(random() * nullableColumns.length)];
    output[index][column] = null;
  }

  // A handful of exact duplicate rows
  const duplicateCount = 22;
  for (let i = 0; i < duplicateCount; i += 1) {
    const index = Math.floor(random() * (output.length - 1));
    output.splice(index + 1, 0, { ...output[index] });
  }

  // A few genuine revenue anomalies (bulk B2B orders)
  for (let i = 0; i < 4; i += 1) {
    const index = Math.floor(random() * output.length);
    const revenue = Number(output[index].Revenue ?? 0);
    output[index].Revenue = Number((revenue * (3.2 + random())).toFixed(2));
    output[index].Orders = Math.round(Number(output[index].Orders ?? 0) * 3);
  }

  return output;
}

export const DEMO_META: DatasetMeta = {
  id: "demo_ecommerce_2025",
  name: "ecommerce-performance-2025.csv",
  source: "demo",
  fileType: "generated",
  sizeBytes: 0,
  createdAt: new Date("2025-08-01T09:00:00Z").toISOString(),
};

/** Approximates the CSV byte size of the generated rows. */
function estimateSize(rows: DatasetRow[]): number {
  if (rows.length === 0) return 0;
  const sample = rows.slice(0, 50);
  const bytes = sample.reduce((acc, row) => {
    const rowLength = Object.values(row).reduce<number>(
      (sum, value) => sum + String(value ?? "").length + 1,
      0,
    );
    return acc + rowLength;
  }, 0);
  return Math.round((bytes / sample.length) * rows.length);
}

let cached: Dataset | null = null;

/** Memoized so repeated navigation never re-profiles the same rows. */
export function getDemoDataset(): Dataset {
  if (!cached) {
    const rows = generateDemoRows();
    cached = buildDataset(rows, { ...DEMO_META, sizeBytes: estimateSize(rows) });
  }
  return cached;
}
