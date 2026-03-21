import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'tiebreaker_open' } })
  if (setting?.value !== 'true') {
    return NextResponse.json({ closed: true, characters: [] })
  }
  const characters = await prisma.tiebreakerCharacter.findMany({
    orderBy: [{ originalVotes: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json({ closed: false, characters })
}
