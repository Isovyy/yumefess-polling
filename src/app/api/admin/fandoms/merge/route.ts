import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { targetFandomId, sourceFandomIds } = await req.json()

  if (!targetFandomId || !Array.isArray(sourceFandomIds) || sourceFandomIds.length === 0) {
    return NextResponse.json({ error: 'targetFandomId and sourceFandomIds required' }, { status: 400 })
  }

  const targetId = parseInt(targetFandomId)
  const sourceIds: number[] = sourceFandomIds.map(Number).filter((id) => !isNaN(id) && id !== targetId)

  if (sourceIds.length === 0) {
    return NextResponse.json({ error: 'No valid source fandoms to merge.' }, { status: 400 })
  }

  // Load target fandom characters with aliases
  const targetCharacters = await prisma.character.findMany({
    where: { fandomId: targetId },
    include: { aliases: true },
  })

  // aliasNorm → characterId for fast duplicate detection
  const targetAliasMap = new Map<string, number>()
  for (const c of targetCharacters) {
    for (const a of c.aliases) {
      targetAliasMap.set(a.aliasNorm, c.id)
    }
  }

  let charactersMerged = 0
  let charactersMoved = 0
  let aliasesMerged = 0

  for (const sourceId of sourceIds) {
    const sourceCharacters = await prisma.character.findMany({
      where: { fandomId: sourceId },
      include: { aliases: true },
    })

    for (const sourceChar of sourceCharacters) {
      // Check if any alias of this character matches a character already in target
      let matchedTargetId: number | null = null
      for (const a of sourceChar.aliases) {
        const found = targetAliasMap.get(a.aliasNorm)
        if (found !== undefined) {
          matchedTargetId = found
          break
        }
      }

      if (matchedTargetId !== null) {
        // Duplicate — reassign votes to target character
        await prisma.submissionEntry.updateMany({
          where: { characterId: sourceChar.id },
          data: { characterId: matchedTargetId },
        })

        // Merge aliases: add any from source that don't already exist in target char
        const targetChar = targetCharacters.find((c) => c.id === matchedTargetId)!
        const existingNorms = new Set(targetChar.aliases.map((a) => a.aliasNorm))

        for (const a of sourceChar.aliases) {
          if (!existingNorms.has(a.aliasNorm)) {
            await prisma.characterAlias.create({
              data: { characterId: matchedTargetId, alias: a.alias, aliasNorm: a.aliasNorm },
            })
            existingNorms.add(a.aliasNorm)
            targetAliasMap.set(a.aliasNorm, matchedTargetId)
            // Keep targetChar.aliases in sync for subsequent iterations
            targetChar.aliases.push({ id: -1, characterId: matchedTargetId, alias: a.alias, aliasNorm: a.aliasNorm })
            aliasesMerged++
          }
        }

        await prisma.character.delete({ where: { id: sourceChar.id } })
        charactersMerged++
      } else {
        // No duplicate — move character to target fandom
        await prisma.character.update({
          where: { id: sourceChar.id },
          data: { fandomId: targetId },
        })

        // Register moved character's aliases in the map for subsequent sources
        for (const a of sourceChar.aliases) {
          targetAliasMap.set(a.aliasNorm, sourceChar.id)
        }
        targetCharacters.push(sourceChar)
        charactersMoved++
      }
    }

    // Move fandom aliases from source to target, and add source fandom name as alias
    const sourceFandom = await prisma.fandom.findUnique({
      where: { id: sourceId },
      include: { aliases: true },
    })

    if (sourceFandom) {
      const targetFandomAliases = await prisma.fandomAlias.findMany({ where: { fandomId: targetId } })
      const existingAliasNorms = new Set(targetFandomAliases.map((a) => a.aliasNorm))

      // Add the source fandom's canonical name as an alias on the target
      if (!existingAliasNorms.has(sourceFandom.nameNorm)) {
        await prisma.fandomAlias.create({
          data: { fandomId: targetId, alias: sourceFandom.name, aliasNorm: sourceFandom.nameNorm },
        }).catch(() => {})
        existingAliasNorms.add(sourceFandom.nameNorm)
      }

      // Copy source fandom's aliases to target
      for (const fa of sourceFandom.aliases) {
        if (!existingAliasNorms.has(fa.aliasNorm)) {
          await prisma.fandomAlias.create({
            data: { fandomId: targetId, alias: fa.alias, aliasNorm: fa.aliasNorm },
          }).catch(() => {})
          existingAliasNorms.add(fa.aliasNorm)
        }
      }
    }

    // Delete source fandom — cascade removes leftover aliases (characters already moved/deleted)
    await prisma.fandom.delete({ where: { id: sourceId } })
  }

  return NextResponse.json({ charactersMerged, charactersMoved, aliasesMerged })
}
