import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yumefess Character Polling 2026',
  description: 'Who is your beloved?',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-teal-50 min-h-screen antialiased">{children}</body>
    </html>
  )
}
