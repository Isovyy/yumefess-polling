import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getBracketAssignment } from '@/lib/tiebreakerShuffle'

export async function GET(req: NextRequest) {
  const setting = await prisma.setting.findUnique({ where: { key: 'tiebreaker_open' } })
  if (setting?.value !== 'true') {
    return NextResponse.json({ closed: true, characters: [] })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT ?? '')).digest('hex')

  const characters = await prisma.tiebreakerCharacter.findMany({
    orderBy: [{ name: 'asc' }],
  })

  const { bracket1 } = getBracketAssignment(characters.map((c) => c.id), ipHash)

  const withBracket = characters.map((c) => ({
    ...c,
    bracket: bracket1.has(c.id) ? 1 : 2,
  }))

  // Sort within each bracket to keep the seeded random order visible
  const b1 = withBracket.filter((c) => c.bracket === 1)
  const b2 = withBracket.filter((c) => c.bracket === 2)

  return NextResponse.json({ closed: false, characters: [...b1, ...b2] })
}
