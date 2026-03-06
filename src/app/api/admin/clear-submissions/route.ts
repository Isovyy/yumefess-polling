import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  await prisma.submissionEntry.deleteMany({})
  await prisma.submission.deleteMany({})
  return NextResponse.json({ success: true })
}
