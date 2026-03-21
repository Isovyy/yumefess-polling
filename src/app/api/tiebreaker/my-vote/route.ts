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

  return NextResponse.json({
    bracket1: b1 ? { characterId: b1.characterId, characterName: b1.character.name } : null,
    bracket2: b2 ? { characterId: b2.characterId, characterName: b2.character.name } : null,
  })
}
