# DataForge AI

> **Turn Raw Data Into Intelligent Decisions.**
> Upload your data, uncover hidden patterns, and transform complex datasets into clear, actionable intelligence.

DataForge AI is a production-grade analytics workspace built with the Next.js App Router. Drop in a
CSV or Excel file and the app parses it, profiles every column, scores its quality, detects real
signals, forecasts what happens next and writes an executive report — all in the browser, with no
account and no API key required.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Folder structure](#folder-structure)
5. [Installation](#installation)
6. [Environment variables](#environment-variables)
7. [Running the app](#running-the-app)
8. [Building for production](#building-for-production)
9. [Demo mode](#demo-mode)
10. [Adding an OpenAI API key](#adding-an-openai-api-key)
11. [How the analysis works](#how-the-analysis-works)
12. [Architecture notes](#architecture-notes)
13. [Limitations](#limitations)
14. [Future improvements](#future-improvements)

---

## Overview

The project is split into two experiences:

| Route | What it is |
| --- | --- |
| `/` | A premium SaaS landing page: hero with an animated analytics console, product showcases, features, pricing and CTA. |
| `/dashboard/*` | The application: overview, datasets, analytics, AI insights, predictions, data quality, data cleaning, reports and settings. |

Everything in the dashboard is driven by a single in-memory `Dataset` object that is profiled once
and shared across pages through a React context. Uploading a new file re-profiles it and every page
updates instantly.

---

## Features

### Data ingestion
- Drag-and-drop upload for **CSV**, **XLS** and **XLSX**
- Real parsing with **PapaParse** (CSV) and **SheetJS / xlsx** (Excel)
- Header normalisation, de-duplication of column names, blank-row skipping
- Friendly, typed errors for unsupported, empty, oversized and corrupted files

### Real profiling (never fabricated)
For every column the app computes: inferred type (numeric / categorical / date / boolean / empty),
missing count and rate, unique count, invalid cells, min, max, mean, median, sum, standard
deviation, P25/P75 and IQR outliers. Dataset-level: total cells, missing cells, duplicate rows,
numeric / categorical / date column lists.

### Analytics workspace
- Choose **X axis**, **Y axis**, **chart type** and **aggregation**
- Line, bar, area, pie and scatter charts via **Recharts**
- Automatic date bucketing, top-N grouping with an "Other" bucket, and series downsampling
- Every chart card supports CSV export and a fullscreen view

### AI insights
Seven detectors run over the profile and only emit a card when they find real evidence:
trend, customer retention, concentration / top performer, anomaly (z-score + IQR), strongest
correlation, budget efficiency (ROAS), and data quality. Each card shows its metric, a confidence
bar and the evidence behind it.

### AI assistant
A floating **Ask DataForge** assistant answers questions about the loaded dataset. It works with or
without an OpenAI key (see [Demo mode](#demo-mode)).

### Predictions
- **Regression** — ordinary least squares with R², RMSE, MAE and a fitted line
- **Classification** — class priors, conditional means, entropy and majority baseline
- **Time-series forecast** — linear trend with a 95% band derived from residual volatility

All predictions are clearly labelled **SIMULATED** because they are computed client-side.

### Data quality
A weighted score (completeness 40%, uniqueness 25%, validity 25%, consistency 10%), a circular
score ring, four headline metrics, a severity-filtered issue list and prioritised recommendations.

### Data cleaning
Detects duplicates, missing numeric/categorical values, stray whitespace, outliers, type mismatches
and empty columns. Each action can be **fixed**, **reviewed** or **ignored**, and every run produces
a before/after comparison plus a preview of the cleaned dataset before you apply it.

### Report generator
Nine sections — executive summary, dataset overview, key metrics, trends, anomalies, AI insights,
recommendations and prediction summary — exportable as standalone **HTML** (print to PDF) or
**Markdown**.

### Craft
Dark glassmorphic UI, cyan → violet → pink gradients, Framer Motion page/card/chart animations,
animated KPI counters, skeleton loaders, empty states, toast notifications, full keyboard focus
states, `prefers-reduced-motion` support and a responsive layout down to 360px.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, TypeScript, React 19) |
| Styling | Tailwind CSS 3 with a custom design system in `styles/globals.css` |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Parsing | PapaParse (CSV), xlsx / SheetJS (Excel) |
| Validation | Zod (file metadata + API request schemas) |
| AI | OpenAI Chat Completions (optional), with a deterministic local fallback engine |

---

## Folder structure

```
DATAFORGE-AI/
├── app/                          # App Router
│   ├── api/
│   │   └── ai/
│   │       ├── chat/route.ts     # POST - server-side AI entry point
│   │       └── status/route.ts   # GET  - reports openai | demo mode
│   ├── dashboard/
│   │   ├── analytics/page.tsx
│   │   ├── cleaning/page.tsx
│   │   ├── datasets/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── predictions/page.tsx
│   │   ├── quality/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx            # Dashboard chrome
│   │   └── page.tsx              # Overview
│   ├── error.tsx                 # Global error boundary
│   ├── layout.tsx                # Root layout, metadata, fonts, providers
│   ├── loading.tsx               # Route-level skeleton
│   ├── not-found.tsx             # 404
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ai/                       # AssistantLauncher, AssistantPanel, RichText
│   ├── brand/                    # Logo + logo mark
│   ├── charts/                   # ChartCard, ChartRenderer, ChartTooltip, Sparkline
│   ├── dashboard/                # KpiCard, InsightCard, PageHeader, DatasetPill, AnimatedNumber
│   ├── data/                     # DataTable
│   ├── landing/                  # Navbar, Hero, HeroVisual, Showcase, Features, Pricing, Footer...
│   ├── layout/                   # DashboardShell, Sidebar, Topbar
│   ├── providers/                # AppProviders
│   ├── ui/                       # Button, Card, Badge, Select, Input, Modal, Tabs, Toaster...
│   └── upload/                   # Dropzone, DatasetSummary
│
├── data/
│   └── demoDataset.ts            # Deterministic e-commerce demo dataset generator
│
├── hooks/
│   ├── useAiStatus.ts            # Reads /api/ai/status
│   ├── useCountUp.ts             # Animated numbers (reduced-motion aware)
│   ├── useDataset.tsx            # Dataset context: upload, profile, insights, quality, KPIs
│   ├── useLocalStorage.ts        # Safe persisted preferences
│   ├── useMediaQuery.ts          # SSR-safe media queries
│   └── useToast.tsx              # Toast context
│
├── lib/
│   ├── ai/
│   │   ├── context.ts            # Dataset -> compact AI context (+ Zod schema)
│   │   ├── demoEngine.ts         # Deterministic local analyst (demo mode)
│   │   └── openai.ts             # Server-only OpenAI client
│   ├── constants.ts              # Limits, palettes, nav links, chart types
│   ├── format.ts                 # Number / currency / date formatters
│   ├── navigation.ts             # Dashboard navigation model
│   ├── stats.ts                  # Pure statistics (mean, median, IQR, OLS, z-score...)
│   └── utils.ts                  # cn(), uid(), seededRandom(), downloadBlob()...
│
├── public/                       # favicon.svg, logo.svg, icon.svg
│
├── services/                     # Framework-free business logic
│   ├── aiService.ts              # Client-facing AI abstraction
│   ├── analyticsService.ts       # Aggregation, KPIs, table query engine
│   ├── cleaningService.ts        # Detect + apply cleaning actions
│   ├── fileParser.ts             # CSV/XLSX parsing + typed errors
│   ├── insightsService.ts        # Seven insight detectors
│   ├── predictionService.ts      # Regression / classification / forecast
│   ├── profiler.ts               # Type inference + column profiling
│   ├── qualityService.ts         # Quality scoring + issue detection
│   └── reportService.ts          # Report assembly + HTML/Markdown export
│
├── styles/
│   └── globals.css               # Design tokens, glass surfaces, utilities
│
├── types/
│   └── index.ts                  # Every shared domain type
│
├── .editorconfig
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Installation

**Requirements:** Node.js 18.18 or newer (Node 20+ recommended) and npm.

```bash
# 1. Open the DATAFORGE-AI folder in Visual Studio Code
# 2. Open the integrated terminal (Ctrl + `)
npm install
```

---

## Environment variables

Copy the example file and fill in only what you need:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local

# Windows (CMD)
copy .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables the OpenAI-powered assistant and narratives. Empty = demo mode. Server-side only. |
| `OPENAI_MODEL` | No | Overrides the model (default `gpt-4o-mini`). |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Reserved for future dataset persistence. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Reserved for future dataset persistence. |
| `NEXT_PUBLIC_APP_URL` | No | Used for metadata / share links. Defaults to `http://localhost:3000`. |

> **Security:** never put a secret in a `NEXT_PUBLIC_*` variable — those are inlined into the browser
> bundle. `OPENAI_API_KEY` is read only inside route handlers (`lib/ai/openai.ts` is `server-only`).

---

## Running the app

```bash
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js config) |
| `npm run typecheck` | `tsc --noEmit` |

---

## Building for production

```bash
npm run build
npm start
```

The build is fully static for every page except the two API routes, which are server-rendered on
demand.

---

## Demo mode

**The app is fully usable with no API key and no configuration.**

- A deterministic e-commerce dataset is generated on first load: `Date`, `Product`, `Category`,
  `Revenue`, `Orders`, `Customers`, `Region`, `Marketing Spend`, `Conversion Rate`.
- The generator encodes real relationships — marketing spend drives orders with diminishing returns,
  conversion rate follows spend efficiency, revenue is orders × price × seasonality, and the
  returning-customer share erodes across the period — so the insights the app finds are genuinely
  present in the numbers.
- A small, deliberate amount of noise (missing cells, duplicate rows and a few bulk-order spikes) is
  injected so the quality, cleaning and anomaly features have real work to do.
- A **DEMO MODE** badge is shown wherever the demo dataset is in use, and the AI assistant is labelled
  **Demo engine**.

Upload your own file at any time from **Datasets** — the badge switches to *Live dataset* and every
statistic is recomputed from your rows. Use **Restore demo** to go back.

---

## Adding an OpenAI API key

1. Open `.env.local`.
2. Set `OPENAI_API_KEY=sk-...` (optionally `OPENAI_MODEL=gpt-4o-mini`).
3. Restart the dev server.

The AI status badge in the top bar changes from **Demo AI Engine** to **AI Engine Online**.

What changes:

| | No key (demo mode) | With key |
| --- | --- | --- |
| Assistant answers | Deterministic engine, intent-matched, computed from the profile | OpenAI, open-ended conversation |
| Executive briefing | Local narrative | OpenAI narrative |
| Report generator | Works | Works (labelled as OpenAI engine) |
| Insights / charts / quality / cleaning / predictions | Work identically | Work identically |

**What is sent to OpenAI:** only a compact dataset *profile* — column names, types, aggregate
statistics, the pre-computed insights and the first five rows. The full dataset never leaves the
browser. If OpenAI is unreachable, rate-limited or rejects the key, the route degrades gracefully to
the local engine instead of surfacing an error.

---

## How the analysis works

| Question | Method |
| --- | --- |
| What type is this column? | Majority vote over present values; dates beat numbers, booleans need 90% agreement |
| Is it trending? | Mean of the opening third vs. the closing third of the aggregated series |
| Is this an anomaly? | Z-score > 2 on the aggregated series, plus the 1.5 × IQR rule per column |
| What drives what? | Strongest absolute Pearson correlation across all numeric pairs (\|r\| ≥ 0.45) |
| How good is the data? | Weighted completeness / uniqueness / validity / consistency score |
| What happens next? | OLS on the period index, with a 95% band from residual standard deviation |

Every figure rendered anywhere in the UI comes from these computations over the loaded rows.

---

## Architecture notes

- **Services are framework-free.** Everything in `services/` and `lib/` is plain TypeScript with no
  React imports, so the analysis engine can be unit-tested or moved to a backend unchanged.
- **One dataset context.** `hooks/useDataset.tsx` owns the dataset and memoises quality, insights and
  KPIs, so navigating between pages never recomputes them.
- **The AI layer is an abstraction.** UI code only calls `services/aiService.ts`; swapping OpenAI for
  another provider or a RAG backend is a single-file change.
- **Performance.** Uploads are capped at 25 MB / 50,000 rows, tables render one page at a time,
  charts downsample long series and cap categories, and sparklines are hand-drawn SVG rather than
  full chart instances.
- **Fonts** are linked at runtime rather than fetched at build time, so `npm run build` works on a
  machine without network access (the system font stack is the fallback).

---

## Limitations

- **Datasets live in memory only.** Refreshing the page returns you to the demo dataset — there is no
  database yet (the Supabase variables are placeholders for that work).
- **Predictions are simulated.** Regression, classification and forecasting are honest but simple
  client-side models, clearly labelled as such. They are not a substitute for a trained ML pipeline.
- **Single sheet.** Only the first worksheet of an Excel workbook is read.
- **Large files.** Files above 25 MB are rejected and datasets are truncated at 50,000 rows to keep
  the browser responsive.
- **Correlation is not causation.** The insight engine surfaces relationships present in the data; it
  does not claim to explain them.
- **No authentication.** Sign In is a link into the dashboard; there is no user system.

---

## Future improvements

- Persist datasets, reports and cleaning history with Supabase
- Server-side parsing and streaming for files above 25 MB
- Multi-sheet Excel support and column-level type overrides
- Saved chart boards and shareable dashboard links
- Real ML backend for predictions (scikit-learn / ONNX service) behind the same service interface
- Scheduled reports and email delivery
- Team workspaces, roles and audit logs
- Unit tests for the statistics, profiling and cleaning services

---

Built as a complete product demonstration. All company names, testimonials and prices on the landing
page are fictional.
