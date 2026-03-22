import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH — toggle suspicious or deleted flag
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { action } = await req.json()
  const entry = await prisma.tiebreakerEntry.findUnique({ where: { id: Number(params.id) } })
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'suspicious') {
    const updated = await prisma.tiebreakerEntry.update({
      where: { id: Number(params.id) },
      data: { suspicious: !entry.suspicious },
    })
    return NextResponse.json({ suspicious: updated.suspicious })
  }

  if (action === 'deleted') {
    const updated = await prisma.tiebreakerEntry.update({
      where: { id: Number(params.id) },
      data: { deleted: !entry.deleted },
    })
    return NextResponse.json({ deleted: updated.deleted })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
