import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — all characters with tiebreaker vote counts, grouped by originalVotes
export async function GET() {
  const characters = await prisma.tiebreakerCharacter.findMany({
    orderBy: [{ originalVotes: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { entries: true } } },
  })
  return NextResponse.json(characters)
}

// POST — add a character to the tiebreaker
export async function POST(req: NextRequest) {
  const { name, fandom, originalVotes } = await req.json()
  if (!name?.trim() || originalVotes == null) {
    return NextResponse.json({ error: 'name and originalVotes are required' }, { status: 400 })
  }
  const character = await prisma.tiebreakerCharacter.create({
    data: { name: name.trim(), fandom: fandom?.trim() || null, originalVotes: Number(originalVotes) },
  })
  return NextResponse.json(character)
}
