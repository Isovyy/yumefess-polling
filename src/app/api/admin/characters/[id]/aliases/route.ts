import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCharacter, normalizeFandom } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

// Add an alias to a character, and retroactively resolve matching unresolved entries.
// Matches entries where:
//   - normalizeCharacter(rawCharacterInput) === aliasNorm
//   - normalizeFandom(rawFandomInput) matches the character's fandom OR any of its fandom aliases
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const characterId = parseInt(params.id)
  if (isNaN(characterId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { alias } = await req.json()
  if (!alias?.trim()) return NextResponse.json({ error: 'Alias required' }, { status: 400 })

  const aliasNorm = normalizeCharacter(alias)

  // Check if alias already exists for a DIFFERENT character — that's a conflict
  const existingAlias = await prisma.characterAlias.findFirst({
    where: { aliasNorm },
  })
  if (existingAlias && existingAlias.characterId !== characterId) {
    return NextResponse.json({ error: 'Alias already exists for a different character.' }, { status: 409 })
  }

  // Create alias if it doesn't exist yet (ignore if already on this character)
  if (!existingAlias) {
    await prisma.characterAlias.create({
      data: { characterId, alias: alias.trim(), aliasNorm },
    })
  }

  // Always run resolution — covers the case where alias existed but entries weren't resolved yet
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { fandom: { include: { aliases: true } } },
  })

  if (character) {
    const fandomNorms = new Set([
      normalizeFandom(character.fandom.name),
      ...character.fandom.aliases.map((a) => a.aliasNorm),
    ])

    const unresolved = await prisma.submissionEntry.findMany({
      where: { characterId: null },
      select: { id: true, rawFandomInput: true, rawCharacterInput: true },
    })

    const toResolve = unresolved.filter(
      (e) =>
        normalizeCharacter(e.rawCharacterInput) === aliasNorm &&
        fandomNorms.has(normalizeFandom(e.rawFandomInput))
    )

    if (toResolve.length > 0) {
      await prisma.submissionEntry.updateMany({
        where: { id: { in: toResolve.map((e) => e.id) } },
        data: { characterId },
      })
    }

    return NextResponse.json({ resolved: toResolve.length })
  }

  return NextResponse.json({ resolved: 0 })
}

// Remove an alias
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { aliasId } = await req.json()
  if (!aliasId) return NextResponse.json({ error: 'aliasId required' }, { status: 400 })

  await prisma.characterAlias.delete({ where: { id: parseInt(aliasId) } })
  return NextResponse.json({ success: true })
}
