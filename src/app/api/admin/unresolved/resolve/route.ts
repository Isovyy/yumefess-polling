import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'

// Create a new fandom+character from an unresolved entry, then resolve all matching entries
export async function POST(req: NextRequest) {
  const { rawFandomInput, rawCharacterInput } = await req.json()
  if (!rawFandomInput?.trim() || !rawCharacterInput?.trim()) {
    return NextResponse.json({ error: 'Missing inputs' }, { status: 400 })
  }

  const fandomNorm = normalizeFandom(rawFandomInput)
  const charNorm = normalizeCharacter(rawCharacterInput)

  // Find or create fandom
  let fandom = await prisma.fandom.findFirst({ where: { nameNorm: fandomNorm } })
  if (!fandom) {
    fandom = await prisma.fandom.create({
      data: { name: rawFandomInput.trim(), nameNorm: fandomNorm },
    })
  }

  // Find or create character
  let character = await prisma.character.findFirst({
    where: { fandomId: fandom.id, canonicalName: rawCharacterInput.trim() },
  })
  if (!character) {
    character = await prisma.character.create({
      data: {
        fandomId: fandom.id,
        canonicalName: rawCharacterInput.trim(),
        aliases: {
          create: [{ alias: rawCharacterInput.trim(), aliasNorm: charNorm }],
        },
      },
    })
  }

  // Resolve all matching unresolved entries
  const unresolved = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    select: { id: true, rawFandomInput: true, rawCharacterInput: true },
  })

  const toResolve = unresolved.filter(
    (e) =>
      normalizeCharacter(e.rawCharacterInput) === charNorm &&
      normalizeFandom(e.rawFandomInput) === fandomNorm
  )

  if (toResolve.length > 0) {
    await prisma.submissionEntry.updateMany({
      where: { id: { in: toResolve.map((e) => e.id) } },
      data: { characterId: character.id },
    })
  }

  return NextResponse.json({ resolved: toResolve.length, fandom: fandom.name, character: character.canonicalName })
}
