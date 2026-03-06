import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCharacter } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const fandomId = req.nextUrl.searchParams.get('fandomId')
  if (!fandomId) return NextResponse.json([])

  const characters = await prisma.character.findMany({
    where: { fandomId: parseInt(fandomId) },
    include: { aliases: { orderBy: { alias: 'asc' } } },
    orderBy: { canonicalName: 'asc' },
  })

  return NextResponse.json(characters)
}

export async function POST(req: NextRequest) {
  const { fandomId, canonicalName, aliases } = await req.json()

  if (!fandomId || !canonicalName?.trim()) {
    return NextResponse.json({ error: 'fandomId and canonicalName required' }, { status: 400 })
  }

  // Canonical name is always included as an alias for matching
  const allAliases: string[] = [canonicalName, ...(Array.isArray(aliases) ? aliases : [])]
  const uniqueAliases = new Map<string, string>() // norm -> original
  for (const a of allAliases) {
    const trimmed = a.trim()
    if (!trimmed) continue
    const norm = normalizeCharacter(trimmed)
    if (!uniqueAliases.has(norm)) uniqueAliases.set(norm, trimmed)
  }

  try {
    const character = await prisma.character.create({
      data: {
        fandomId: parseInt(fandomId),
        canonicalName: canonicalName.trim(),
        aliases: {
          create: Array.from(uniqueAliases.entries()).map(([norm, alias]) => ({
            alias,
            aliasNorm: norm,
          })),
        },
      },
      include: { aliases: true },
    })
    return NextResponse.json(character)
  } catch {
    return NextResponse.json({ error: 'Character already exists in this fandom.' }, { status: 409 })
  }
}
