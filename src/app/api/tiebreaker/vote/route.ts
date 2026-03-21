import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function getBracket(originalVotes: number): number {
  return originalVotes > 7 ? 1 : 2
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // Accept { bracket1CharacterId?, bracket2CharacterId? } — at least one required
  const { bracket1CharacterId, bracket2CharacterId } = body

  if (!bracket1CharacterId && !bracket2CharacterId) {
    return NextResponse.json({ error: 'Please select at least one character.' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT ?? '')).digest('hex')

  const results: { bracket: number; characterName: string }[] = []

  for (const [bracketNum, charId] of [[1, bracket1CharacterId], [2, bracket2CharacterId]] as [number, number | undefined][]) {
    if (!charId) continue

    const character = await prisma.tiebreakerCharacter.findUnique({ where: { id: charId } })
    if (!character) return NextResponse.json({ error: `Character not found.` }, { status: 404 })

    // Verify character belongs to the correct bracket
    if (getBracket(character.originalVotes) !== bracketNum) {
      return NextResponse.json({ error: `Character does not belong to Bracket ${bracketNum}.` }, { status: 400 })
    }

    const existing = await prisma.tiebreakerEntry.findUnique({
      where: { ipHash_bracket: { ipHash, bracket: bracketNum } },
    })
    if (existing) {
      return NextResponse.json({ error: `You have already voted in Bracket ${bracketNum}.` }, { status: 409 })
    }

    await prisma.tiebreakerEntry.create({ data: { ipHash, bracket: bracketNum, characterId: charId } })
    results.push({ bracket: bracketNum, characterName: character.name })
  }

  return NextResponse.json({ ok: true, results })
}
