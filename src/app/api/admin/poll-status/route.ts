import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'poll_closed' } })
  return NextResponse.json({ closed: setting?.value === 'true' })
}

export async function POST() {
  const current = await prisma.setting.findUnique({ where: { key: 'poll_closed' } })
  const nowClosed = current?.value !== 'true'
  await prisma.setting.upsert({
    where: { key: 'poll_closed' },
    update: { value: String(nowClosed) },
    create: { key: 'poll_closed', value: String(nowClosed) },
  })
  return NextResponse.json({ closed: nowClosed })
}
