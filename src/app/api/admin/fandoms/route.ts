import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom } from '@/lib/normalize'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fandoms = await prisma.fandom.findMany({
    orderBy: { name: 'asc' },
    include: { aliases: true },
  })
  return NextResponse.json(fandoms)
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  const nameNorm = normalizeFandom(name)
  try {
    const fandom = await prisma.fandom.create({
      data: { name: name.trim(), nameNorm },
    })
    return NextResponse.json(fandom)
  } catch {
    return NextResponse.json({ error: 'Fandom already exists.' }, { status: 409 })
  }
}
