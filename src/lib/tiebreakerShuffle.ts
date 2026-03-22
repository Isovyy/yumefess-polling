/**
 * Deterministic seeded shuffle for tiebreaker bracket assignment.
 * Same ipHash always produces the same bracket split; different IPs get different splits.
 */

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  // LCG parameters (Numerical Recipes)
  let s = seed >>> 0 // force unsigned 32-bit
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getBracketAssignment(
  characterIds: number[],
  ipHash: string
): { bracket1: Set<number>; bracket2: Set<number> } {
  // Derive a 32-bit seed from the first 8 hex chars of the IP hash
  const seed = parseInt(ipHash.slice(0, 8), 16)
  const shuffled = shuffleWithSeed([...characterIds], seed)
  // Bracket 1 gets ceil(n/2), bracket 2 gets floor(n/2)
  const mid = Math.ceil(shuffled.length / 2)
  return {
    bracket1: new Set(shuffled.slice(0, mid)),
    bracket2: new Set(shuffled.slice(mid)),
  }
}
