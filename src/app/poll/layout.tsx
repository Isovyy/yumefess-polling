import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PollLayout({ children }: { children: React.ReactNode }) {
  const setting = await prisma.setting.findUnique({ where: { key: 'poll_closed' } })
  if (setting?.value === 'true') redirect('/maintenance')
  return <>{children}</>
}
