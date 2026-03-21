import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns characters eligible for the tiebreaker:
// - Bracket 1: characters with >7 votes where multiple characters share that vote count (actual ties)
// - Bracket 2: ALL characters with exactly 6 or 7 votes
export async function GET() {
  const voteCounts = await prisma.submissionEntry.groupBy({
    by: ['characterId'],
    where: { characterId: { not: null } },
    _count: { id: true },
  })

  const voteMap = new Map(voteCounts.map((v) => [v.characterId!, v._count.id]))

  // Find vote counts >7 that appear more than once (bracket 1 ties)
  const countFreq = new Map<number, number>()
  for (const v of voteCounts) {
    const votes = v._count.id
    if (votes > 7) countFreq.set(votes, (countFreq.get(votes) ?? 0) + 1)
  }
  const tiedHighVoteCounts = new Set(
    [...countFreq.entries()].filter(([, freq]) => freq > 1).map(([votes]) => votes)
  )

  // Collect eligible character IDs
  const eligibleIds = voteCounts
    .filter((v) => {
      const votes = v._count.id
      const isBracket1 = votes > 7 && tiedHighVoteCounts.has(votes)
      const isBracket2 = votes === 6 || votes === 7
      return isBracket1 || isBracket2
    })
    .map((v) => v.characterId!)

  const characters = await prisma.character.findMany({
    where: { id: { in: eligibleIds } },
    include: { fandom: true },
  })

  const result = characters.map((c) => ({
    id: c.id,
    name: c.canonicalName,
    fandom: c.fandom.name,
    originalVotes: voteMap.get(c.id) ?? 0,
  })).sort((a, b) => b.originalVotes - a.originalVotes || a.name.localeCompare(b.name))

  return NextResponse.json(result)
}
