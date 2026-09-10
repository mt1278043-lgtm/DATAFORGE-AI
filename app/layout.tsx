import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/providers/AppProviders";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: `${APP_NAME} - ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "data analytics",
    "AI insights",
    "data quality",
    "predictions",
    "business intelligence",
    "CSV analysis",
  ],
  authors: [{ name: APP_NAME }],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    title: `${APP_NAME} - ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/*
          Fonts are linked at runtime rather than fetched at build time, so
          `npm run build` succeeds on machines without network access.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
