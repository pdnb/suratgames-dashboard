/** Substrings in the schedule "รอบ" column that indicate a championship / medal final. */
const CHAMPIONSHIP_KEYWORDS = ["ชิงชนะเลิศ", "รอบชิง"] as const;

/**
 * Returns true when the scraped round label indicates a final that typically awards medals.
 */
export function isChampionshipRound(round: string): boolean {
  const t = round.replace(/\s+/g, " ").trim();
  if (!t) return false;
  return CHAMPIONSHIP_KEYWORDS.some((k) => t.includes(k));
}
