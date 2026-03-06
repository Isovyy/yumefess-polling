import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { characterId: string } }
) {
  const characterId = parseInt(params.characterId)
  if (isNaN(characterId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const entries = await prisma.submissionEntry.findMany({
    where: { characterId },
    select: { rawCharacterInput: true },
  })

  // Count occurrences of each raw input (case-insensitive)
  const counts = new Map<string, number>()
  for (const entry of entries) {
    const key = entry.rawCharacterInput.toLowerCase().trim()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return NextResponse.json(
    Array.from(counts.entries())
      .map(([input, count]) => ({ input, count }))
      .sort((a, b) => b.count - a.count)
  )
}
