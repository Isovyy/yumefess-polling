import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fandoms = await prisma.fandom.findMany({
    include: {
      characters: {
        include: { aliases: true },
        orderBy: { canonicalName: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  const lines: string[] = []
  lines.push(`// @ts-check`)
  lines.push(`const { PrismaClient } = require('@prisma/client')`)
  lines.push(``)
  lines.push(`const prisma = new PrismaClient()`)
  lines.push(``)
  lines.push(`function normalizeFandom(s) {`)
  lines.push(`  return s.toLowerCase().replace(/[^a-z0-9\\s]/g, '').trim().replace(/\\s+/g, ' ')`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`function normalizeCharacter(s) {`)
  lines.push(`  return s.toLowerCase().trim().split(/\\s+/).sort().join(' ')`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`const DATA = [`)

  for (const fandom of fandoms) {
    lines.push(`  {`)
    lines.push(`    name: ${JSON.stringify(fandom.name)},`)
    lines.push(`    characters: [`)
    for (const char of fandom.characters) {
      const aliases = char.aliases.map((a) => a.alias)
      lines.push(`      { canonicalName: ${JSON.stringify(char.canonicalName)}, aliases: ${JSON.stringify(aliases)} },`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
  }

  lines.push(`]`)
  lines.push(``)
  lines.push(`async function main() {`)
  lines.push(`  console.log('Seeding database...')`)
  lines.push(`  for (const fandomData of DATA) {`)
  lines.push(`    const nameNorm = normalizeFandom(fandomData.name)`)
  lines.push(`    const fandom = await prisma.fandom.upsert({`)
  lines.push(`      where: { nameNorm },`)
  lines.push(`      update: {},`)
  lines.push(`      create: { name: fandomData.name, nameNorm },`)
  lines.push(`    })`)
  lines.push(`    for (const charData of fandomData.characters) {`)
  lines.push(`      const character = await prisma.character.upsert({`)
  lines.push(`        where: { fandomId_canonicalName: { fandomId: fandom.id, canonicalName: charData.canonicalName } },`)
  lines.push(`        update: {},`)
  lines.push(`        create: { fandomId: fandom.id, canonicalName: charData.canonicalName },`)
  lines.push(`      })`)
  lines.push(`      for (const alias of charData.aliases) {`)
  lines.push(`        const aliasNorm = normalizeCharacter(alias)`)
  lines.push(`        await prisma.characterAlias.upsert({`)
  lines.push(`          where: { characterId_aliasNorm: { characterId: character.id, aliasNorm } },`)
  lines.push(`          update: {},`)
  lines.push(`          create: { characterId: character.id, alias, aliasNorm },`)
  lines.push(`        })`)
  lines.push(`      }`)
  lines.push(`    }`)
  lines.push(`    console.log(\`  ✓ \${fandomData.name} (\${fandomData.characters.length} characters)\`)`)
  lines.push(`  }`)
  lines.push(`  console.log('Done!')`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`main()`)
  lines.push(`  .catch((e) => { console.error(e); process.exit(1) })`)
  lines.push(`  .finally(() => prisma.$disconnect())`)

  const content = lines.join('\n')

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="seed.js"',
    },
  })
}
