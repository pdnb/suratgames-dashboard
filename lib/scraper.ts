import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { isChampionshipRound } from "./championship-round";
import type {
  ChampionshipSummaryRow,
  MedalRow,
  MedalTable,
  Match,
  MatchStatus,
  Schedule,
  ScheduleStats,
  Sport,
} from "./types";
import { dateBEToISO, parseDateBE } from "./date";

const BASE_URL = "https://suratgames.sat.or.th/";
const MEDAL_URL = `${BASE_URL}total_medal-dwt.asp`;

const HEADER_LABELS = [
  "รายการ",
  "รอบ",
  "เวลา",
  "สนาม",
  "Start List",
  "Result",
  "Status",
];

const FOOTER_REGEX = /^รวม\s.+\s\d+\s+รายการ\s*$/;

function clean(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absUrl(href: string | undefined | null): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return null;
  try {
    return new URL(trimmed, BASE_URL).toString();
  } catch {
    return null;
  }
}

function pickQueryParam(url: string | null, key: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.searchParams.get(key);
  } catch {
    return null;
  }
}

function detectStatus($cell: cheerio.Cheerio<any>): MatchStatus {
  const imgSrc = ($cell.find("img").attr("src") || "").toLowerCase();
  if (imgSrc.includes("running")) return "LIVE";
  const text = clean($cell.text()).toLowerCase();
  if (text === "official") return "FINISHED";
  return "PENDING";
}

function buildSourceUrl(dateBE: string): string {
  return `${BASE_URL}compettable2-dwt.asp?dateid=${encodeURIComponent(dateBE)}`;
}

function parseMedalNumber(value: string): number {
  const cleaned = clean(value).replace(/,/g, "");
  if (!cleaned || cleaned === "-") return 0;
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchSchedule(dateBE: string): Promise<Schedule> {
  const parts = parseDateBE(dateBE);
  if (!parts) {
    throw new Error(
      `รูปแบบวันที่ไม่ถูกต้อง: ${dateBE} (ต้องเป็น DD/MM/YYYY แบบ พ.ศ.)`
    );
  }

  const sourceUrl = buildSourceUrl(dateBE);

  const res = await fetch(sourceUrl, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SuratGamesDashboard/1.0; +https://suratgames.sat.or.th)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`เซิร์ฟเวอร์ต้นทางตอบกลับ ${res.status} ${res.statusText}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const html = iconv.decode(buf, "windows-874");
  const $ = cheerio.load(html);

  const allTrs = $("tr").toArray();

  type Section = { headerIdx: number; footerIdx: number };
  const sections: Section[] = [];

  const headerIdxs: number[] = [];
  const footerIdxs: number[] = [];

  allTrs.forEach((el, i) => {
    const cells = $(el)
      .children("td,th")
      .toArray()
      .map((c) => clean($(c).text()));
    if (
      cells.length >= 7 &&
      cells[0] === HEADER_LABELS[0] &&
      cells[1] === HEADER_LABELS[1] &&
      cells[2] === HEADER_LABELS[2] &&
      cells[3] === HEADER_LABELS[3]
    ) {
      headerIdxs.push(i);
      return;
    }
    const txt = clean($(el).text());
    if (FOOTER_REGEX.test(txt)) {
      footerIdxs.push(i);
    }
  });

  for (const hi of headerIdxs) {
    const fi = footerIdxs.find((f) => f > hi);
    if (fi !== undefined) sections.push({ headerIdx: hi, footerIdx: fi });
  }

  const sports: Sport[] = [];

  for (const { headerIdx, footerIdx } of sections) {
    const sportName = clean($(allTrs[headerIdx - 1]).text()) || "ไม่ทราบชนิดกีฬา";
    const matches: Match[] = [];

    for (let i = headerIdx + 1; i < footerIdx; i++) {
      const tr = allTrs[i];
      const $tr = $(tr);
      const cells = $tr.children("td,th").toArray();
      if (cells.length < 7) continue;

      const $event = $(cells[0]);
      const $round = $(cells[1]);
      const $time = $(cells[2]);
      const $venue = $(cells[3]);
      const $startList = $(cells[4]);
      const $result = $(cells[5]);
      const $status = $(cells[6]);

      const event = clean($event.text());
      const round = clean($round.text());
      const time = clean($time.text());
      if (!time && !event) continue;

      const venueText = clean($venue.text());
      const venue = venueText && venueText !== "-" ? venueText : null;
      const venueUrl = absUrl($venue.find("a").attr("href"));

      const startListUrl = absUrl($startList.find("a").attr("href"));
      const resultUrl = absUrl($result.find("a").attr("href"));

      const status = detectStatus($status);

      const idSource =
        pickQueryParam(resultUrl, "stche_id") ||
        pickQueryParam(startListUrl, "stche_id") ||
        pickQueryParam(venueUrl, "stche_id");
      const sportId =
        pickQueryParam(resultUrl, "st_sportid") ||
        pickQueryParam(venueUrl, "st_sportid");

      const id = idSource || `${sportName}-${time}-${event}-${i}`;

      matches.push({
        id,
        sportId,
        sport: sportName,
        event,
        round,
        time,
        venue,
        venueUrl,
        startListUrl,
        resultUrl,
        status,
      });
    }

    const liveCount = matches.filter((m) => m.status === "LIVE").length;
    const finishedCount = matches.filter((m) => m.status === "FINISHED").length;
    const pendingCount = matches.filter((m) => m.status === "PENDING").length;

    sports.push({
      name: sportName,
      total: matches.length,
      liveCount,
      finishedCount,
      pendingCount,
      matches,
    });
  }

  const statsBase = sports.reduce(
    (acc, s) => ({
      totalSports: acc.totalSports + 1,
      totalMatches: acc.totalMatches + s.total,
      liveMatches: acc.liveMatches + s.liveCount,
      finishedMatches: acc.finishedMatches + s.finishedCount,
      pendingMatches: acc.pendingMatches + s.pendingCount,
    }),
    {
      totalSports: 0,
      totalMatches: 0,
      liveMatches: 0,
      finishedMatches: 0,
      pendingMatches: 0,
    }
  );

  const championshipSummary: ChampionshipSummaryRow[] = [];
  let finishedChampionshipMatchCount = 0;
  for (const s of sports) {
    for (const m of s.matches) {
      if (!isChampionshipRound(m.round)) continue;
      championshipSummary.push({
        sport: m.sport,
        event: m.event,
        round: m.round,
        time: m.time,
      });
      if (m.status === "FINISHED") {
        finishedChampionshipMatchCount += 1;
      }
    }
  }

  const nFinals = championshipSummary.length;
  const stats: ScheduleStats = {
    ...statsBase,
    championshipMatchCount: nFinals,
    finishedChampionshipMatchCount,
    goldMedalEvents: nFinals,
  };

  return {
    dateBE,
    dateAD: dateBEToISO(parts),
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    sports,
    stats,
    championshipSummary,
  };
}

export async function fetchMedalTable(limit = 10): Promise<MedalTable> {
  const res = await fetch(MEDAL_URL, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SuratGamesDashboard/1.0; +https://suratgames.sat.or.th)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`เซิร์ฟเวอร์ต้นทางตอบกลับ ${res.status} ${res.statusText}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const html = iconv.decode(buf, "windows-874");
  const $ = cheerio.load(html);

  const rows: MedalRow[] = [];
  $("tr").each((_, tr) => {
    const cells = $(tr).find("td").toArray();
    if (cells.length < 6) return;

    const rankRaw = clean($(cells[0]).text()).replace(".", "");
    if (!/^\d+$/.test(rankRaw)) return;

    const province = clean($(cells[2]).text());
    if (!province) return;

    const gold = parseMedalNumber($(cells[3]).text());
    const silver = parseMedalNumber($(cells[4]).text());
    const bronze = parseMedalNumber($(cells[5]).text());
    const totalCellText = cells[6] ? $(cells[6]).text() : "";
    const total = parseMedalNumber(totalCellText) || gold + silver + bronze;

    if(total > 0) {
      rows.push({
        rank: Number.parseInt(rankRaw, 10),
        province,
        gold,
        silver,
        bronze,
        total,
      });
    }
  });

  rows.sort((a, b) => {
    // if (a.total !== b.total) return b.total - a.total;
    if (a.gold !== b.gold) return b.gold - a.gold;
    // if (a.silver !== b.silver) return b.silver - a.silver;
    // if (a.bronze !== b.bronze) return b.bronze - a.bronze;
    return a.rank - b.rank;
  });

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: MEDAL_URL,
    rows: rows.slice(0, Math.max(1, limit)),
  };
}
