'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AdminHub() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-3">
          <Image src="/yumefess-icon.png" alt="Yumefess" width={64} height={64} />
        </div>
        <h1 className="text-2xl font-bold text-teal-500">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Yumefess Character Polling 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/dashboard/poll"
          className="group bg-white border border-teal-100 rounded-2xl p-6 shadow-sm hover:border-teal-300 hover:shadow-md transition flex flex-col gap-2"
        >
          <span className="text-2xl">📊</span>
          <span className="font-semibold text-gray-700 group-hover:text-teal-500 transition">Original Poll</span>
          <span className="text-xs text-gray-400">View stats, manage characters, resolve entries</span>
        </Link>

        <Link
          href="/admin/tiebreaker"
          className="group bg-white border border-teal-100 rounded-2xl p-6 shadow-sm hover:border-teal-300 hover:shadow-md transition flex flex-col gap-2"
        >
          <span className="text-2xl">⚖️</span>
          <span className="font-semibold text-gray-700 group-hover:text-teal-500 transition">Tiebreaker</span>
          <span className="text-xs text-gray-400">Manage tied characters and view tiebreaker votes</span>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Logout
        </button>
      </div>
    </main>
  )
}
