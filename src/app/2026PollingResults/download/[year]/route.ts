import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const allowed = ['2022', '2023', '2026']

export async function GET(_req: NextRequest, { params }: { params: { year: string } }) {
  const { year } = params

  if (!allowed.includes(year)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filePath = path.join(
    process.cwd(),
    'src/app/2026PollingResults',
    `${year} Yumefess Oshi Polling Results.pdf`
  )

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${year} Yumefess Oshi Polling Results.pdf"`,
    },
  })
}
