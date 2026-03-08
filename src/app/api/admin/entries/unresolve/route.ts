import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Set characterId = null on the given entry IDs, putting them back in the unresolved pool
export async function POST(req: NextRequest) {
  const { entryIds } = await req.json()
  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    return NextResponse.json({ error: 'entryIds required' }, { status: 400 })
  }

  await prisma.submissionEntry.updateMany({
    where: { id: { in: entryIds } },
    data: { characterId: null },
  })

  return NextResponse.json({ unresolved: entryIds.length })
}
