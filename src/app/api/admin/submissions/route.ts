import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const search = req.nextUrl.searchParams.get('search')?.trim() ?? ''
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        entries: {
          some: {
            OR: [
              { rawCharacterInput: { contains: search, mode: 'insensitive' as const } },
              { rawFandomInput: { contains: search, mode: 'insensitive' as const } },
              { character: { canonicalName: { contains: search, mode: 'insensitive' as const } } },
              { character: { fandom: { name: { contains: search, mode: 'insensitive' as const } } } },
            ],
          },
        },
      }
    : {}

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
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
    prisma.submission.count({ where }),
  ])

  return NextResponse.json({ submissions, total, page, pageSize })
}
