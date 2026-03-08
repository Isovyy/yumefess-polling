import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

// Directly assign all unresolved entries matching (rawFandomInput, rawCharacterInput) to a character.
// No alias is created — just sets characterId on the matching entries.
export async function POST(req: NextRequest) {
  const { rawFandomInput, rawCharacterInput, characterId } = await req.json()
  if (!rawFandomInput?.trim() || !rawCharacterInput?.trim() || !characterId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const fandomNorm = normalizeFandom(rawFandomInput)
  const charNorm = normalizeCharacter(rawCharacterInput)

  const unresolved = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    select: { id: true, rawFandomInput: true, rawCharacterInput: true },
  })

  const toResolve = unresolved.filter(
    (e) =>
      normalizeFandom(e.rawFandomInput) === fandomNorm &&
      normalizeCharacter(e.rawCharacterInput) === charNorm
  )

  if (toResolve.length > 0) {
    await prisma.submissionEntry.updateMany({
      where: { id: { in: toResolve.map((e) => e.id) } },
      data: { characterId: parseInt(characterId) },
    })
  }

  return NextResponse.json({ resolved: toResolve.length })
}
