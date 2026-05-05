/**
 * Natural ordering for Thai tournament round labels (qualifying -> finals).
 * Unknown labels fall back to a high key and sort by Thai locale alphabetically.
 */

const ORDER: Array<[RegExp, number]> = [
  [/คัดเลือก/, 10],
  [/รอบแรก|รอบ\s*1\b/, 20],
  [/รอบ\s*64/, 25],
  [/รอบ\s*32/, 30],
  [/รอบ\s*16/, 40],
  [/รอบ\s*8|ก่อนรองชนะเลิศ/, 50],
  [/รอบ\s*4|รองชนะเลิศ/, 60],
  [/ชิงเหรียญทองแดง/, 65],
  [/ชิงชนะเลิศ|ชิงเหรียญทอง/, 70],
];

const UNKNOWN_KEY = 1000;

export function roundSortKey(round: string): number {
  const t = round.replace(/\s+/g, " ").trim();
  if (!t) return UNKNOWN_KEY + 1;
  for (const [re, key] of ORDER) {
    if (re.test(t)) return key;
  }
  return UNKNOWN_KEY;
}

export function compareRounds(a: string, b: string): number {
  const ka = roundSortKey(a);
  const kb = roundSortKey(b);
  if (ka !== kb) return ka - kb;
  return a.localeCompare(b, "th");
}
