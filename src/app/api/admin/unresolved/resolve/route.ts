import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

// Create a new fandom+character from an unresolved entry, then resolve all matching entries.
// Fandom matching includes the character fandom's aliases (e.g. "Love and Producer" = "MLQC").
export async function POST(req: NextRequest) {
  const { rawFandomInput, rawCharacterInput } = await req.json()
  if (!rawFandomInput?.trim() || !rawCharacterInput?.trim()) {
    return NextResponse.json({ error: 'Missing inputs' }, { status: 400 })
  }

  const fandomNorm = normalizeFandom(rawFandomInput)
  const charNorm = normalizeCharacter(rawCharacterInput)

  // Find or create fandom (check fandom aliases too)
  let fandom = await prisma.fandom.findFirst({
    where: { nameNorm: fandomNorm },
    include: { aliases: true },
  })
  if (!fandom) {
    // Check if this input matches a known fandom alias
    const fandomAlias = await prisma.fandomAlias.findFirst({
      where: { aliasNorm: fandomNorm },
      include: { fandom: { include: { aliases: true } } },
    })
    if (fandomAlias) {
      fandom = fandomAlias.fandom
    }
  }
  if (!fandom) {
    fandom = await prisma.fandom.create({
      data: { name: rawFandomInput.trim(), nameNorm: fandomNorm },
      include: { aliases: true },
    })
  }

  // Find existing character by alias norm (case-insensitive: "gavin" matches "Gavin")
  const existingAlias = await prisma.characterAlias.findFirst({
    where: { aliasNorm: charNorm, character: { fandomId: fandom.id } },
    include: { character: true },
  })
  let character = existingAlias?.character ?? null

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

  // Resolve all matching unresolved entries (fandom name + all fandom aliases)
  const fandomNorms = new Set([
    normalizeFandom(fandom.name),
    ...(fandom.aliases ?? []).map((a) => a.aliasNorm),
  ])

  const unresolved = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    select: { id: true, rawFandomInput: true, rawCharacterInput: true },
  })

  const toResolve = unresolved.filter(
    (e) =>
      normalizeCharacter(e.rawCharacterInput) === charNorm &&
      fandomNorms.has(normalizeFandom(e.rawFandomInput))
  )

  if (toResolve.length > 0) {
    await prisma.submissionEntry.updateMany({
      where: { id: { in: toResolve.map((e) => e.id) } },
      data: { characterId: character.id },
    })
  }

  return NextResponse.json({ resolved: toResolve.length, fandom: fandom.name, character: character.canonicalName })
}
