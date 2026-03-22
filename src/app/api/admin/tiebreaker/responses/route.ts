import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const entries = await prisma.tiebreakerEntry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { character: true },
  })
  // Exclude skipped entries (characterId is null — user submitted but left that bracket empty)
  return NextResponse.json(entries.filter((e) => e.characterId !== null))
}
