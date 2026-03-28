import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const submissions = await prisma.submission.findMany({
    select: { socialHandle: true },
    orderBy: { createdAt: 'asc' },
  })

  const handles = submissions
    .map((s) => s.socialHandle?.trim())
    .filter((h): h is string => !!h)

  const text = handles.join('\n')

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="user-handles-${new Date().toISOString().slice(0, 10)}.txt"`,
    },
  })
}
