import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'tiebreaker_open' } })
  return NextResponse.json({ open: setting?.value === 'true' })
}

export async function POST() {
  const current = await prisma.setting.findUnique({ where: { key: 'tiebreaker_open' } })
  const nowOpen = current?.value !== 'true'
  await prisma.setting.upsert({
    where: { key: 'tiebreaker_open' },
    update: { value: String(nowOpen) },
    create: { key: 'tiebreaker_open', value: String(nowOpen) },
  })
  return NextResponse.json({ open: nowOpen })
}
