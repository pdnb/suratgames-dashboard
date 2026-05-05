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

export interface ScheduleStats {
  totalSports: number;
  totalMatches: number;
  liveMatches: number;
  finishedMatches: number;
  pendingMatches: number;
}

export interface Schedule {
  dateBE: string;
  dateAD: string;
  fetchedAt: string;
  sourceUrl: string;
  sports: Sport[];
  stats: ScheduleStats;
}

export interface ApiError {
  error: string;
  detail?: string;
}
