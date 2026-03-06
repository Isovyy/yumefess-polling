import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          include: {
            character: { include: { fandom: true } },
          },
        },
      },
    }),
    prisma.submission.count(),
  ])

  return NextResponse.json({ submissions, total, page, pageSize })
}
