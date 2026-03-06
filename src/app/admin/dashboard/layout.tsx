import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')
  const secret = process.env.ADMIN_SECRET

  if (!secret || token?.value !== secret) {
    redirect('/admin')
  }

  return <>{children}</>
}
