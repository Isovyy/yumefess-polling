'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Wrong password.')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Image src="/yumefess-icon.png" alt="Yumefess" width={64} height={64} />
        </div>
        <h1 className="text-2xl font-bold text-teal-500">Admin</h1>
      </div>
      <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Password"
          className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 bg-teal-400 hover:bg-teal-500 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </main>
  )
}
