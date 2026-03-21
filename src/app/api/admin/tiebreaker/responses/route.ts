import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const entries = await prisma.tiebreakerEntry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { character: true },
  })
  return NextResponse.json(entries)
}
