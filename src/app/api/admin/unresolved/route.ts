import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const entries = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    orderBy: { id: 'desc' },
    take: 500,
  })

  // Group by fandomInput + characterInput
  const groups = new Map<string, { rawFandomInput: string; rawCharacterInput: string; count: number }>()
  for (const entry of entries) {
    const key = `${entry.rawFandomInput.toLowerCase()}::${entry.rawCharacterInput.toLowerCase()}`
    const existing = groups.get(key)
    if (existing) {
      existing.count++
    } else {
      groups.set(key, {
        rawFandomInput: entry.rawFandomInput,
        rawCharacterInput: entry.rawCharacterInput,
        count: 1,
      })
    }
  }

  return NextResponse.json(
    Array.from(groups.values()).sort((a, b) => b.count - a.count)
  )
}
