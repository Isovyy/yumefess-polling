import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [submissions, characters] = await Promise.all([
    prisma.submission.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          include: {
            character: { include: { fandom: true } },
          },
        },
      },
    }),
    prisma.character.findMany({
      include: {
        fandom: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { submissions: { _count: 'desc' } },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalSubmissions: submissions.length,
    summary: characters
      .filter((c) => c._count.submissions > 0)
      .map((c) => ({
        character: c.canonicalName,
        fandom: c.fandom.name,
        votes: c._count.submissions,
      })),
    submissions: submissions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      socialHandle: s.socialHandle ?? null,
      entries: s.entries.map((e) => ({
        rank: e.rank,
        rawFandomInput: e.rawFandomInput,
        rawCharacterInput: e.rawCharacterInput,
        resolvedCharacter: e.character?.canonicalName ?? null,
        resolvedFandom: e.character?.fandom.name ?? null,
      })),
    })),
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="oshi-poll-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
