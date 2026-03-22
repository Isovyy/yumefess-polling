import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const entries = await prisma.tiebreakerEntry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { character: true },
  })
  // Exclude skipped entries (no character) but keep removed (deleted) ones for the record
  return NextResponse.json(entries.filter((e) => e.characterId !== null), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
