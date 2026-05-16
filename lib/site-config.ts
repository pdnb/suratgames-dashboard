function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

export const SOURCE_BASE_URL = normalizeBaseUrl(
  process.env.SOURCE_BASE_URL ?? "https://suratgames.sat.or.th/"
);

export const EVENT_TITLE =
  process.env.NEXT_PUBLIC_EVENT_TITLE ?? "สุราษฎร์ธานีเกมส์";
export const EVENT_SUBTITLE =
  process.env.NEXT_PUBLIC_EVENT_SUBTITLE ??
  "กีฬาเยาวชนแห่งชาติครั้งที่ 41";
