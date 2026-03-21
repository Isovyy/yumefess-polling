import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE — remove a tiebreaker vote
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.tiebreakerEntry.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}

// PATCH — toggle suspicious flag
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const entry = await prisma.tiebreakerEntry.findUnique({ where: { id: Number(params.id) } })
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.tiebreakerEntry.update({
    where: { id: Number(params.id) },
    data: { suspicious: !entry.suspicious },
  })
  return NextResponse.json({ suspicious: updated.suspicious })
}
