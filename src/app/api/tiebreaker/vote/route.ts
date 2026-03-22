import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getBracketAssignment } from '@/lib/tiebreakerShuffle'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { bracket1CharacterId, bracket2CharacterId } = body

  if (!bracket1CharacterId && !bracket2CharacterId) {
    return NextResponse.json({ error: 'Please select at least one character.' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT ?? '')).digest('hex')

  // One submission per IP — reject if they've already voted in any bracket
  const existingAny = await prisma.tiebreakerEntry.findFirst({ where: { ipHash } })
  if (existingAny) {
    return NextResponse.json({ error: 'Kamu sudah mengirimkan vote.' }, { status: 409 })
  }

  // Regenerate this IP's bracket assignment for server-side validation
  // Must use the same order as the characters endpoint so the shuffle produces the same result
  const allCharacters = await prisma.tiebreakerCharacter.findMany({ select: { id: true }, orderBy: [{ name: 'asc' }] })
  const { bracket1, bracket2 } = getBracketAssignment(allCharacters.map((c) => c.id), ipHash)

  const results: { bracket: number; characterName: string | null }[] = []

  for (const [bracketNum, charId, bracketSet] of [
    [1, bracket1CharacterId, bracket1],
    [2, bracket2CharacterId, bracket2],
  ] as [number, number | undefined, Set<number>][]) {
    if (!charId) {
      // Skipped bracket — record a null entry to lock out future submissions
      await prisma.tiebreakerEntry.create({ data: { ipHash, bracket: bracketNum } })
      results.push({ bracket: bracketNum, characterName: null })
      continue
    }

    if (!bracketSet.has(charId)) {
      return NextResponse.json(
        { error: `Character does not belong to Bracket ${bracketNum}.` },
        { status: 400 }
      )
    }

    const character = await prisma.tiebreakerCharacter.findUnique({ where: { id: charId } })
    if (!character) return NextResponse.json({ error: 'Character not found.' }, { status: 404 })

    await prisma.tiebreakerEntry.create({ data: { ipHash, bracket: bracketNum, characterId: charId } })
    results.push({ bracket: bracketNum, characterName: character.name })
  }

  return NextResponse.json({ ok: true, results })
}
