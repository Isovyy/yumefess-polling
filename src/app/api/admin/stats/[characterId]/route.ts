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
    select: { id: true, rawCharacterInput: true },
  })

  // Group by normalised raw input, collect entry IDs
  const groups = new Map<string, { input: string; count: number; entryIds: number[] }>()
  for (const entry of entries) {
    const key = entry.rawCharacterInput.toLowerCase().trim()
    const existing = groups.get(key)
    if (existing) {
      existing.count++
      existing.entryIds.push(entry.id)
    } else {
      groups.set(key, { input: entry.rawCharacterInput, count: 1, entryIds: [entry.id] })
    }
  }

  return NextResponse.json(
    Array.from(groups.values()).sort((a, b) => b.count - a.count)
  )
}
