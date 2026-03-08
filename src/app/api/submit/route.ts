import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeFandom, normalizeCharacter } from '@/lib/normalize'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

async function resolveFandom(rawInput: string) {
  const norm = normalizeFandom(rawInput)
  if (!norm) return null
  const fandom = await prisma.fandom.findFirst({ where: { nameNorm: norm } })
  if (fandom) return fandom
  // Also check fandom aliases (e.g. "Love and Producer" resolves to MLQC)
  const alias = await prisma.fandomAlias.findFirst({
    where: { aliasNorm: norm },
    include: { fandom: true },
  })
  return alias?.fandom ?? null
}

async function resolveCharacter(fandomId: number, rawInput: string) {
  const norm = normalizeCharacter(rawInput)
  if (!norm) return null
  const alias = await prisma.characterAlias.findFirst({
    where: {
      aliasNorm: norm,
      character: { fandomId },
    },
    include: { character: true },
  })
  return alias?.character ?? null
}

export async function POST(req: NextRequest) {
  let body: { entries?: unknown; website?: string; socialHandle?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: bots fill this in, real users don't see it
  if (body.website) {
    return NextResponse.json({ success: true })
  }

  // Validate entries
  if (!Array.isArray(body.entries) || body.entries.length === 0 || body.entries.length > 3) {
    return NextResponse.json({ error: 'Please provide 1–3 oshi entries.' }, { status: 400 })
  }

  const entries = body.entries as { fandomInput?: string; characterInput?: string }[]
  const validEntries = entries.filter(
    (e) => typeof e.fandomInput === 'string' && e.fandomInput.trim() &&
            typeof e.characterInput === 'string' && e.characterInput.trim()
  )

  if (validEntries.length === 0) {
    return NextResponse.json({ error: 'Please fill in at least one oshi.' }, { status: 400 })
  }

  // Rate limit: 1 submission per IP per 24 hours
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') ?? 'unknown')
  const ipHash = crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_SALT ?? 'default_salt'))
    .digest('hex')

  if (process.env.DISABLE_RATE_LIMIT !== 'true') {
    const dayAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const existing = await prisma.submission.findFirst({
      where: { ipHash, createdAt: { gte: dayAgo } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted recently. Please wait 2 weeks before submitting again.' },
        { status: 429 }
      )
    }
  }

  // Resolve each entry
  const resolvedEntries = await Promise.all(
    validEntries.map(async (entry, i) => {
      const fandom = await resolveFandom(entry.fandomInput!)
      const character = fandom ? await resolveCharacter(fandom.id, entry.characterInput!) : null
      return {
        rank: i + 1,
        rawFandomInput: entry.fandomInput!.trim().slice(0, 200),
        rawCharacterInput: entry.characterInput!.trim().slice(0, 200),
        characterId: character?.id ?? null,
      }
    })
  )

  // Reject if two entries resolve to the same character
  const resolvedIds = resolvedEntries.map((e) => e.characterId).filter((id) => id !== null)
  if (new Set(resolvedIds).size < resolvedIds.length) {
    return NextResponse.json(
      { error: 'You have entered the same character more than once.' },
      { status: 400 }
    )
  }

  const socialHandle = typeof body.socialHandle === 'string'
    ? body.socialHandle.trim().slice(0, 100) || null
    : null

  await prisma.submission.create({
    data: {
      ipHash,
      socialHandle,
      entries: { create: resolvedEntries },
    },
  })

  return NextResponse.json({ success: true })
}
