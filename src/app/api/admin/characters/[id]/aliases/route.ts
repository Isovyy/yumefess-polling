import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCharacter, normalizeFandom } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

// Add an alias to a character, and retroactively resolve matching unresolved entries
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const characterId = parseInt(params.id)
  if (isNaN(characterId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { alias } = await req.json()
  if (!alias?.trim()) return NextResponse.json({ error: 'Alias required' }, { status: 400 })

  const aliasNorm = normalizeCharacter(alias)

  try {
    const created = await prisma.characterAlias.create({
      data: { characterId, alias: alias.trim(), aliasNorm },
    })

    // Retroactively resolve unresolved entries that match this alias + fandom
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { fandom: true },
    })

    if (character) {
      const fandomNorm = normalizeFandom(character.fandom.name)
      const unresolved = await prisma.submissionEntry.findMany({
        where: { characterId: null },
        select: { id: true, rawFandomInput: true, rawCharacterInput: true },
      })

      const toResolve = unresolved.filter(
        (e) =>
          normalizeCharacter(e.rawCharacterInput) === aliasNorm &&
          normalizeFandom(e.rawFandomInput) === fandomNorm
      )

      if (toResolve.length > 0) {
        await prisma.submissionEntry.updateMany({
          where: { id: { in: toResolve.map((e) => e.id) } },
          data: { characterId },
        })
      }

      return NextResponse.json({ ...created, resolved: toResolve.length })
    }

    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: 'Alias already exists for this character.' }, { status: 409 })
  }
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
