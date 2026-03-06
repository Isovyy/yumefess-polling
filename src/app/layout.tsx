import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oshi Poll',
  description: 'Vote for your oshi!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-teal-50 min-h-screen antialiased">{children}</body>
    </html>
  )
}
