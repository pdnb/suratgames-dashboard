export type MatchStatus = "LIVE" | "FINISHED" | "PENDING";

export interface Match {
  id: string;
  sportId: string | null;
  sport: string;
  event: string;
  round: string;
  time: string;
  venue: string | null;
  venueUrl: string | null;
  startListUrl: string | null;
  resultUrl: string | null;
  status: MatchStatus;
}

export interface Sport {
  name: string;
  total: number;
  liveCount: number;
  finishedCount: number;
  pendingCount: number;
  matches: Match[];
}

export interface ChampionshipSummaryRow {
  sport: string;
  event: string;
  round: string;
  time: string;
}

export interface MedalRow {
  rank: number;
  province: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface MedalTable {
  fetchedAt: string;
  sourceUrl: string;
  rows: MedalRow[];
}

export interface ScheduleStats {
  totalSports: number;
  totalMatches: number;
  liveMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  /** Matches whose round text indicates a championship final (medal round). */
  championshipMatchCount: number;
  /** Championship matches whose status is FINISHED. */
  finishedChampionshipMatchCount: number;
  /** One gold per championship match row in the schedule (display convention). */
  goldMedalEvents: number;
}

export interface Schedule {
  dateBE: string;
  dateAD: string;
  fetchedAt: string;
  sourceUrl: string;
  sports: Sport[];
  stats: ScheduleStats;
  championshipSummary: ChampionshipSummaryRow[];
}

/** Gold-medal / final schedule matrix from schedule_final-dwt.asp */
export interface ScheduleFinalSportRow {
  name: string;
  total: number;
  perDay: number[];
}

export interface ScheduleFinal {
  fetchedAt: string;
  sourceUrl: string;
  /** Header dates BE e.g. ["03/05/2569", ...] */
  dates: string[];
  sports: ScheduleFinalSportRow[];
  totalSports: number;
  /** Grand total cell (bottom-right) */
  totalMedals: number;
}

export type GridCellKind = "none" | "compete" | "final";

export interface ScheduleGridCell {
  kind: GridCellKind;
  /** Count of gold-medal / F markers in the source cell (usually 1). */
  finalCount: number;
}

export interface ScheduleGridSportRow {
  name: string;
  /** `clickid` from the source site (sport filter id). */
  sportId: string | null;
  cells: ScheduleGridCell[];
  /** Days with schedule icon (non-final competition days). */
  competeDays: number;
  /** Days marked `F` (gold-medal day in source legend). */
  finalDays: number;
}

/** Sport × date matrix from Schedule-dwt.asp */
export interface ScheduleGrid {
  fetchedAt: string;
  sourceUrl: string;
  dates: string[];
  sports: ScheduleGridSportRow[];
  totals: {
    totalSports: number;
    totalCompeteCells: number;
    totalFinalCells: number;
    perDayCompete: number[];
    perDayFinal: number[];
  };
}

/**
 * Day-by-day overview parsed from `All_Print_DaybyDay.asp` —
 * a single dump of every match across all 15 competition days.
 */
export interface OverviewDailyRow {
  /** Original Thai header e.g. "ประจำวันที่ 03 พฤษภาคม 2569" */
  rawLabel: string;
  /** Buddhist-Era date in DD/MM/YYYY (parsed from the header). */
  dateBE: string;
  /** ISO (Gregorian) date YYYY-MM-DD. */
  dateAD: string;
  total: number;
  finished: number;
  live: number;
  pending: number;
  /** "รอบชิงชนะเลิศ" matches scheduled this day. */
  finals: number;
  finishedFinals: number;
}

export interface OverviewSportRow {
  /** Parent sport e.g. "ฮอกกี้" (split before " - "). */
  name: string;
  total: number;
  finished: number;
  live: number;
  pending: number;
  finals: number;
  finishedFinals: number;
}

export interface OverviewTotals {
  totalDays: number;
  totalSports: number;
  totalMatches: number;
  finishedMatches: number;
  liveMatches: number;
  pendingMatches: number;
  totalFinals: number;
  finishedFinals: number;
}

export interface OverviewLiveMatch {
  sport: string;
  parentSport: string;
  event: string;
  round: string;
  time: string;
  pair: string;
  group: string;
  teams: string;
  venue: string;
  dateBE: string;
}

export interface OverviewTodayFinal {
  sport: string;
  parentSport: string;
  event: string;
  round: string;
  time: string;
  pair: string;
  group: string;
  teams: string;
  venue: string;
  status: "FINISHED" | "LIVE" | "PENDING";
}

export interface AllOverview {
  fetchedAt: string;
  sourceUrl: string;
  /** First/last day of the event (BE). */
  firstDateBE: string;
  lastDateBE: string;
  /** Daily breakdown ordered by date. */
  daily: OverviewDailyRow[];
  /** Per parent-sport breakdown sorted by `total` descending. */
  sports: OverviewSportRow[];
  totals: OverviewTotals;
  /** Currently LIVE matches (status cell shows the running.gif). */
  liveMatches: OverviewLiveMatch[];
  /** Today's รอบชิงชนะเลิศ list (date matches server "today" in BE). */
  todayBE: string;
  todayFinals: OverviewTodayFinal[];
}

export interface ApiError {
  error: string;
  detail?: string;
}
