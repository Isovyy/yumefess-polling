import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { canonicalName } = await req.json()
  if (!canonicalName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  await prisma.character.update({ where: { id }, data: { canonicalName: canonicalName.trim() } })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await prisma.character.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
