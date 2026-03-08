import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'

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
    const key = `${normalizeFandom(entry.rawFandomInput)}::${normalizeCharacter(entry.rawCharacterInput)}`
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

// Manually add an unresolved entry
export async function POST(req: NextRequest) {
  const { rawFandomInput, rawCharacterInput } = await req.json()
  if (!rawFandomInput?.trim() || !rawCharacterInput?.trim()) {
    return NextResponse.json({ error: 'Missing inputs' }, { status: 400 })
  }

  const submission = await prisma.submission.create({
    data: {
      ipHash: 'admin_manual',
      entries: {
        create: {
          rank: 1,
          rawFandomInput: rawFandomInput.trim(),
          rawCharacterInput: rawCharacterInput.trim(),
          characterId: null,
        },
      },
    },
  })

  return NextResponse.json({ success: true, submissionId: submission.id })
}

// Delete all unresolved entries for a given (fandomInput, characterInput) pair
export async function DELETE(req: NextRequest) {
  const { rawFandomInput, rawCharacterInput } = await req.json()
  if (!rawFandomInput?.trim() || !rawCharacterInput?.trim()) {
    return NextResponse.json({ error: 'Missing inputs' }, { status: 400 })
  }

  const fandomNorm = normalizeFandom(rawFandomInput)
  const charNorm = normalizeCharacter(rawCharacterInput)

  const unresolved = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    select: { id: true, rawFandomInput: true, rawCharacterInput: true },
  })

  const toDelete = unresolved.filter(
    (e) =>
      normalizeFandom(e.rawFandomInput) === fandomNorm &&
      normalizeCharacter(e.rawCharacterInput) === charNorm
  )

  if (toDelete.length > 0) {
    await prisma.submissionEntry.deleteMany({
      where: { id: { in: toDelete.map((e) => e.id) } },
    })
  }

  return NextResponse.json({ deleted: toDelete.length })
}
