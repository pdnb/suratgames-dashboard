"use client";

import type { Match, MatchStatus, Schedule } from "@/lib/types";
import {
  MATCH_LAYOUT_STORAGE_KEY,
  parseMatchLayout,
  type MatchLayoutMode,
} from "@/lib/match-layout";
import { formatThaiLong, todayBE } from "@/lib/date";
import { AlertTriangle, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import DatePickerBE from "./DatePickerBE";
import FilterBar, { type StatusFilter } from "./FilterBar";
import LayoutModeToggle from "./LayoutModeToggle";
import RefreshIndicator from "./RefreshIndicator";
import SportSection from "./SportSection";
import StatsHeader, { HeroBadge } from "./StatsHeader";

const REFRESH_MS = 30_000;

interface Props {
  initialDate: string;
}

const fetcher = async (url: string): Promise<Schedule> => {
  const res = await fetch(url);
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error || j.detail || "";
    } catch {
      // ignore
    }
    throw new Error(detail || `โหลดข้อมูลไม่สำเร็จ (${res.status})`);
  }
  return res.json();
};

export default function Dashboard({ initialDate }: Props) {
  const [date, setDate] = useState<string>(initialDate);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [matchLayout, setMatchLayout] = useState<MatchLayoutMode>("grid");
  const skipLayoutPersistOnce = useRef(true);

  useEffect(() => {
    const stored = parseMatchLayout(
      typeof window !== "undefined"
        ? localStorage.getItem(MATCH_LAYOUT_STORAGE_KEY)
        : null
    );
    if (stored) setMatchLayout(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (skipLayoutPersistOnce.current) {
      skipLayoutPersistOnce.current = false;
      return;
    }
    localStorage.setItem(MATCH_LAYOUT_STORAGE_KEY, matchLayout);
  }, [matchLayout]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("date") !== date) {
      url.searchParams.set("date", date);
      window.history.replaceState(null, "", url.toString());
    }
  }, [date]);

  const apiUrl = `/api/schedule?date=${encodeURIComponent(date)}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<Schedule>(
    apiUrl,
    fetcher,
    {
      refreshInterval: REFRESH_MS,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    }
  );

  const handleToggleSport = useCallback((name: string) => {
    setSelectedSports((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleClearSports = useCallback(() => setSelectedSports(new Set()), []);

  const matchPasses = useCallback(
    (m: Match) => {
      if (statusFilter !== "ALL" && m.status !== (statusFilter as MatchStatus))
        return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${m.event} ${m.round} ${m.venue ?? ""} ${m.id}`
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    },
    [statusFilter, search]
  );

  const filteredSections = useMemo(() => {
    if (!data) return [];
    const useSportFilter = selectedSports.size > 0;
    return data.sports
      .filter((s) => (useSportFilter ? selectedSports.has(s.name) : true))
      .map((s) => ({
        sport: s,
        matches: s.matches.filter(matchPasses),
      }))
      .sort((a, b) => {
        const aLive = a.matches.some((m) => m.status === "LIVE") ? 1 : 0;
        const bLive = b.matches.some((m) => m.status === "LIVE") ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return b.matches.length - a.matches.length;
      });
  }, [data, selectedSports, matchPasses]);

  const visibleMatchCount = filteredSections.reduce(
    (n, s) => n + s.matches.length,
    0
  );

  const stats = data?.stats ?? {
    totalSports: 0,
    totalMatches: 0,
    liveMatches: 0,
    finishedMatches: 0,
    pendingMatches: 0,
    championshipMatchCount: 0,
    goldMedalEvents: 0,
  };

  const visibleChampionships = useMemo(() => {
    const rows = data?.championshipSummary ?? [];
    if (selectedSports.size === 0) return rows;
    return rows.filter((r) => selectedSports.has(r.sport));
  }, [data?.championshipSummary, selectedSports]);

  const sportsForFilter = (data?.sports ?? []).map((s) => ({
    name: s.name,
    total: s.total,
    liveCount: s.liveCount,
  }));

  const dateLabel = formatThaiLong(date);
  const isToday = date === todayBE();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <HeroBadge stats={stats} />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              ตารางการแข่งขัน
              <span className="ml-2 text-sky-700 dark:text-sky-300">
                {dateLabel}
              </span>
              {isToday && (
                <span className="ml-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 align-middle text-xs font-medium text-sky-700 dark:border-sky-400/30 dark:text-sky-200">
                  วันนี้
                </span>
              )}
            </h1>
            {/* {data?.sourceUrl && (
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-300"
              >
                แหล่งข้อมูล: suratgames.sat.or.th
                <ExternalLink size={11} />
              </a>
            )} */}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePickerBE value={date} onChange={setDate} />
            <RefreshIndicator
              fetchedAt={data?.fetchedAt ?? null}
              refreshIntervalMs={REFRESH_MS}
              isValidating={isValidating}
              onRefresh={() => mutate()}
            />
          </div>
        </div>

        <StatsHeader stats={stats} />
      </header>

      <div className="mb-5">
        <FilterBar
          sports={sportsForFilter}
          selectedSports={selectedSports}
          onToggleSport={handleToggleSport}
          onClearSports={handleClearSports}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {data && visibleChampionships.length > 0 && (
        <section
          className="mb-5 rounded-2xl border border-amber-500/35 bg-amber-500/8 p-4 dark:border-amber-400/25 dark:bg-amber-400/7"
          aria-label="รายการรอบชิงชนะเลิศวันนี้"
        >
          <details className="group">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                  <Trophy size={18} className="shrink-0 opacity-90" />
                  <span>
                    รอบชิงชนะเลิศวันนี้ ({visibleChampionships.length}{" "}
                    รายการ)
                  </span>
                </div>
                <span className="text-xs font-medium text-amber-800/80 group-open:hidden dark:text-amber-200/80">
                  แตะเพื่อดูรายละเอียด
                </span>
              </div>
            </summary>
            <ul className="mt-3 space-y-2 border-t border-amber-500/25 pt-3 dark:border-amber-400/20">
              {visibleChampionships.map((row, idx) => (
                <li
                  key={`${row.sport}-${row.time}-${row.event}-${idx}`}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-white/60 px-3 py-2 text-sm dark:border-amber-400/15 dark:bg-slate-900/40"
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {row.sport}
                  </div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {row.event}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{row.round}</span>
                    {row.time ? (
                      <span className="font-mono tabular-nums">{row.time}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-400/30 dark:text-red-200">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">โหลดข้อมูลไม่สำเร็จ</div>
            <div className="opacity-80">{(error as Error).message}</div>
            <button
              type="button"
              onClick={() => mutate()}
              className="mt-2 rounded-full border border-red-500/40 px-3 py-1 text-xs hover:bg-red-500/10 dark:border-red-300/30"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      )}

      {isLoading && !data && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-900/5 bg-slate-900/5 dark:border-white/5 dark:bg-white/5"
            />
          ))}
        </div>
      )}

      {data && filteredSections.length === 0 && (
        <div className="rounded-2xl border border-slate-900/10 bg-slate-900/5 p-10 text-center text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <Trophy size={28} className="mx-auto mb-2 opacity-40" />
          <p>
            ไม่มีรายการที่ตรงกับตัวกรอง — ลองเปลี่ยนสถานะ/ชนิดกีฬา หรือล้างคำค้น
          </p>
        </div>
      )}

      {data && filteredSections.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              แสดง{" "}
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {visibleMatchCount}
              </span>{" "}
              จาก{" "}
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {stats.totalMatches}
              </span>{" "}
              รายการ
            </span>
            <LayoutModeToggle value={matchLayout} onChange={setMatchLayout} />
          </div>
          <div className="grid gap-4">
            {filteredSections.map(({ sport, matches }) => (
              <SportSection
                key={sport.name}
                sport={sport}
                matches={matches}
                layout={matchLayout}
              />
            ))}
          </div>
        </>
      )}

      <footer className="mt-10 border-t border-slate-900/10 pt-6 text-center text-xs text-slate-500 dark:border-white/5 dark:text-slate-500">
        ข้อมูลจาก suratgames.sat.or.th • รีเฟรชอัตโนมัติทุก {REFRESH_MS / 1000}{" "}
        วินาที • เวลาเริ่มเป็นค่าโดยประมาณ ตารางอาจมีการเปลี่ยนแปลง
      </footer>
    </main>
  );
}
