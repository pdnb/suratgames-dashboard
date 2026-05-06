"use client";

import type { MatchStatus } from "@/lib/types";
import { Search, X } from "lucide-react";

export type StatusFilter = "ALL" | MatchStatus;

interface SportOption {
  name: string;
  total: number;
  liveCount: number;
}

interface RoundOption {
  name: string;
  total: number;
}

interface Props {
  sports: SportOption[];
  selectedSports: Set<string>;
  onToggleSport: (name: string) => void;
  onClearSports: () => void;
  rounds: RoundOption[];
  selectedRounds: Set<string>;
  onToggleRound: (name: string) => void;
  onClearRounds: () => void;
  statusFilter: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

const STATUS_OPTIONS: { id: StatusFilter; label: string; cls: string }[] = [
  {
    id: "ALL",
    label: "ทั้งหมด",
    cls: "data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-700 dark:data-[active=true]:border-sky-400/50 dark:data-[active=true]:text-sky-200",
  },
  {
    id: "LIVE",
    label: "กำลังแข่ง",
    cls: "data-[active=true]:border-red-500/60 data-[active=true]:bg-red-500/15 data-[active=true]:text-red-700 dark:data-[active=true]:border-red-400/50 dark:data-[active=true]:text-red-200",
  },
  {
    id: "PENDING",
    label: "รอแข่ง",
    cls: "data-[active=true]:border-slate-500/60 data-[active=true]:bg-slate-500/15 data-[active=true]:text-slate-800 dark:data-[active=true]:border-slate-400/50 dark:data-[active=true]:text-slate-100",
  },
  {
    id: "FINISHED",
    label: "จบแล้ว",
    cls: "data-[active=true]:border-emerald-500/60 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-700 dark:data-[active=true]:border-emerald-400/50 dark:data-[active=true]:text-emerald-200",
  },
];

export default function FilterBar({
  sports,
  selectedSports,
  onToggleSport,
  onClearSports,
  rounds,
  selectedRounds,
  onToggleRound,
  onClearRounds,
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-900/10 bg-bg-soft/70 p-4 backdrop-blur-sm dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 sm:min-w-0 sm:flex-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
            สถานะ
          </span>
          <div className="scrollbar-thin-x flex gap-2 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-active={active}
                  onClick={() => onStatusChange(opt.id)}
                  className={`shrink-0 rounded-full border border-slate-900/10 bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-900/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 ${opt.cls}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาทีม/รายการ/สนาม"
            className="w-full rounded-full border border-slate-900/10 bg-white/70 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/50 sm:w-72"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-900/10 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="ล้างคำค้น"
            >
              <X size={12} />
            </button>
          )}
        </div> */}
      </div>

      {sports.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
            ชนิดกีฬา
          </span>
          <div className="scrollbar-thin-x flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={onClearSports}
              data-active={selectedSports.size === 0}
              className="shrink-0 rounded-full border border-slate-900/10 bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-900/20 data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:data-[active=true]:border-sky-400/50 dark:data-[active=true]:text-sky-200"
            >
              ทั้งหมด
            </button>
            {sports.map((s) => {
              const active = selectedSports.has(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onToggleSport(s.name)}
                  data-active={active}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-900/20 data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:data-[active=true]:border-sky-400/50 dark:data-[active=true]:text-sky-200"
                >
                  {s.liveCount > 0 && (
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 live-pulse dark:bg-red-400" />
                  )}
                  {s.name}
                  <span className="text-[10px] tabular-nums opacity-60">
                    {s.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rounds.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
            รอบ
          </span>
          <div className="scrollbar-thin-x flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={onClearRounds}
              data-active={selectedRounds.size === 0}
              className="shrink-0 rounded-full border border-slate-900/10 bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-900/20 data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:data-[active=true]:border-sky-400/50 dark:data-[active=true]:text-sky-200"
            >
              ทั้งหมด
            </button>
            {rounds.map((r) => {
              const active = selectedRounds.has(r.name);
              return (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => onToggleRound(r.name)}
                  data-active={active}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-900/10 bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-900/20 data-[active=true]:border-sky-500/60 data-[active=true]:bg-sky-500/15 data-[active=true]:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:data-[active=true]:border-sky-400/50 dark:data-[active=true]:text-sky-200"
                >
                  {r.name}
                  <span className="text-[10px] tabular-nums opacity-60">
                    {r.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
