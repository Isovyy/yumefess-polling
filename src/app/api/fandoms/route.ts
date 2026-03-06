import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom } from '@/lib/normalize'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const norm = normalizeFandom(q)

  const fandoms = await prisma.fandom.findMany({
    where: norm
      ? { nameNorm: { contains: norm } }
      : {},
    orderBy: { name: 'asc' },
    take: 8,
  })

  return NextResponse.json(fandoms.map((f) => ({ id: f.id, name: f.name })))
}
