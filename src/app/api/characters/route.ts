import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCharacter } from '@/lib/normalize'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const fandomId = req.nextUrl.searchParams.get('fandomId')

  if (!fandomId) return NextResponse.json([])

  const fid = parseInt(fandomId)
  if (isNaN(fid)) return NextResponse.json([])

  // Empty query: return all characters for the fandom
  if (!q.trim()) {
    const characters = await prisma.character.findMany({
      where: { fandomId: fid },
      orderBy: { canonicalName: 'asc' },
      take: 10,
    })
    return NextResponse.json(characters.map((c) => ({ id: c.id, name: c.canonicalName })))
  }

  const norm = normalizeCharacter(q)

  // Search aliases (which include canonical names) for this fandom
  const aliases = await prisma.characterAlias.findMany({
    where: {
      aliasNorm: { contains: norm },
      character: { fandomId: fid },
    },
    include: { character: true },
    take: 20,
  })

  // Deduplicate: one result per canonical character, prefer the alias that matched
  const seen = new Set<number>()
  const results: { id: number; name: string; matchedAlias: string }[] = []

  for (const a of aliases) {
    if (!seen.has(a.characterId)) {
      seen.add(a.characterId)
      results.push({ id: a.character.id, name: a.character.canonicalName, matchedAlias: a.alias })
    }
  }

  return NextResponse.json(results.slice(0, 8))
}
