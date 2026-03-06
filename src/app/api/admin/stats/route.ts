import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fandoms = await prisma.fandom.findMany({
    include: { characters: true },
    orderBy: { name: 'asc' },
  })

  // Vote count per character (resolved submissions only)
  const voteCounts = await prisma.submissionEntry.groupBy({
    by: ['characterId'],
    where: { characterId: { not: null } },
    _count: { id: true },
  })

  const voteMap = new Map(voteCounts.map((v) => [v.characterId!, v._count.id]))

  const unresolvedCount = await prisma.submissionEntry.count({
    where: { characterId: null },
  })

  const totalSubmissions = await prisma.submission.count()

  const result = fandoms.map((fandom) => ({
    id: fandom.id,
    name: fandom.name,
    characters: fandom.characters
      .map((c) => ({
        id: c.id,
        name: c.canonicalName,
        votes: voteMap.get(c.id) ?? 0,
      }))
      .filter((c) => c.votes > 0)
      .sort((a, b) => b.votes - a.votes),
  })).filter((f) => f.characters.length > 0)

  // All characters across all fandoms with votes
  const topCharacters = result
    .flatMap((f) => f.characters.map((c) => ({ name: c.name, fandom: f.name, value: c.votes })))
    .sort((a, b) => b.value - a.value)

  // Top fandoms by total votes
  const topFandoms = result
    .map((f) => ({ name: f.name, value: f.characters.reduce((s, c) => s + c.votes, 0) }))
    .sort((a, b) => b.value - a.value)

  return NextResponse.json({ fandoms: result, unresolvedCount, totalSubmissions, topCharacters, topFandoms })
}
