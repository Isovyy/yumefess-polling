import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await prisma.tiebreakerCharacter.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
