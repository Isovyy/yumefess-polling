import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

// Add a fandom alias (e.g. "mlcq" as alias for "Mr. Love: Queen's Choice").
// Retroactively resolves existing unresolved entries that match the alias fandom
// and any known character in this fandom — same behaviour as character aliases.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const fandomId = parseInt(params.id)
  if (isNaN(fandomId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { alias } = await req.json()
  if (!alias?.trim()) return NextResponse.json({ error: 'Alias required' }, { status: 400 })

  const aliasNorm = normalizeFandom(alias)

  try {
    await prisma.fandomAlias.create({
      data: { fandomId, alias: alias.trim(), aliasNorm },
    })
  } catch {
    return NextResponse.json({ error: 'Alias already exists for this fandom.' }, { status: 409 })
  }

  // Retroactively resolve unresolved entries that used this fandom name
  // and whose character name matches any known character alias in this fandom
  const characters = await prisma.character.findMany({
    where: { fandomId },
    include: { aliases: true },
  })

  // Build a map: charNorm → characterId
  const charNormToId = new Map<string, number>()
  for (const character of characters) {
    for (const a of character.aliases) {
      charNormToId.set(a.aliasNorm, character.id)
    }
  }

  const unresolved = await prisma.submissionEntry.findMany({
    where: { characterId: null },
    select: { id: true, rawFandomInput: true, rawCharacterInput: true },
  })

  // Group entries to resolve by characterId
  const resolveGroups = new Map<number, number[]>() // characterId → entry ids
  for (const entry of unresolved) {
    if (normalizeFandom(entry.rawFandomInput) !== aliasNorm) continue
    const charId = charNormToId.get(normalizeCharacter(entry.rawCharacterInput))
    if (!charId) continue
    const group = resolveGroups.get(charId) ?? []
    group.push(entry.id)
    resolveGroups.set(charId, group)
  }

  let resolved = 0
  for (const [characterId, ids] of resolveGroups) {
    await prisma.submissionEntry.updateMany({
      where: { id: { in: ids } },
      data: { characterId },
    })
    resolved += ids.length
  }

  return NextResponse.json({ resolved })
}

// Remove a fandom alias
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { aliasId } = await req.json()
  if (!aliasId) return NextResponse.json({ error: 'aliasId required' }, { status: 400 })

  await prisma.fandomAlias.delete({ where: { id: parseInt(aliasId) } })
  return NextResponse.json({ success: true })
}
