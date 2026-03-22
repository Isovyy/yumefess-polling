import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT ?? '')).digest('hex')

  const entries = await prisma.tiebreakerEntry.findMany({
    where: { ipHash },
    include: { character: true },
  })

  const b1 = entries.find((e) => e.bracket === 1)
  const b2 = entries.find((e) => e.bracket === 2)

  const toResult = (e: typeof b1) => {
    if (!e) return null
    if (!e.characterId) return { skipped: true }
    return { characterId: e.characterId, characterName: e.character!.name }
  }

  return NextResponse.json({
    bracket1: toResult(b1),
    bracket2: toResult(b2),
  })
}
