export type MatchLayoutMode = "grid" | "list";

export const MATCH_LAYOUT_STORAGE_KEY = "match-layout";

export function parseMatchLayout(
  raw: string | null
): MatchLayoutMode | null {
  if (raw === "grid" || raw === "list") return raw;
  return null;
}
