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

export interface ApiError {
  error: string;
  detail?: string;
}
