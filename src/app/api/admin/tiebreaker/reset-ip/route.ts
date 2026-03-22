import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const { ipHash } = await req.json()
  if (!ipHash || typeof ipHash !== 'string') {
    return NextResponse.json({ error: 'ipHash required' }, { status: 400 })
  }
  const result = await prisma.tiebreakerEntry.deleteMany({ where: { ipHash } })
  return NextResponse.json({ deleted: result.count })
}
