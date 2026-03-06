/**
 * Normalize a fandom name for matching:
 * - lowercase, trim, strip punctuation, collapse spaces
 * "Ensemble Stars!!" => "ensemble stars"
 */
export function normalizeFandom(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize a character name for matching:
 * - lowercase, strip punctuation, sort tokens alphabetically
 * "Tenshouin Eichi" and "Eichi Tenshouin" both => "eichi tenshouin"
 * "Tartaglia" / "Childe" / "Ajax" are stored as separate aliases pointing to one character
 */
export function normalizeCharacter(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}
