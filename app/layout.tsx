import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DataForge AI',
  description: 'Professional AI-powered data forge application',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
