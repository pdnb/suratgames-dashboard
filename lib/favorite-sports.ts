/** localStorage key for favored sport names (Thai strings from scraper). */
export const FAVORITE_SPORTS_STORAGE_KEY = "favorite-sports";

export function parseFavoriteSports(raw: string | null): string[] {
  if (raw == null || raw.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const t = item.trim();
      if (t.length > 0) out.push(t);
    }
    return [...new Set(out)];
  } catch {
    return [];
  }
}
