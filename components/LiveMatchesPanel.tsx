"use client";

import type { OverviewLiveMatch } from "@/lib/types";
import { Activity, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  matches: OverviewLiveMatch[];
  className?: string;
}

const VISIBLE_COUNT = 6;

export default function LiveMatchesPanel({ matches, className = "" }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () =>
      [...matches].sort(
        (a, b) =>
          a.parentSport.localeCompare(b.parentSport, "th") ||
          a.time.localeCompare(b.time)
      ),
    [matches]
  );

  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);

  return (
    <section
      aria-label="แมตช์ที่กำลังแข่ง"
      className={[
        "rounded-2xl border border-rose-500/30 bg-rose-50/40 p-4 shadow-sm dark:border-rose-400/30 dark:bg-rose-500/10",
        className,
      ].join(" ")}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
          </span>
          กำลังแข่ง
          <span className="ml-1 rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] text-rose-700 dark:text-rose-200">
            {matches.length}
          </span>
        </div>
        <Activity size={16} className="text-rose-500" />
      </header>

      {matches.length === 0 ? (
        <p className="rounded-xl bg-white/70 px-3 py-4 text-center text-xs text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
          ไม่มีแมตช์กำลังแข่งในขณะนี้
        </p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((m, i) => (
            <li
              key={`${m.dateBE}-${m.time}-${m.event}-${i}`}
              className="rounded-xl border border-rose-500/20 bg-white/80 px-3 py-2 text-xs text-slate-800 shadow-sm dark:border-rose-400/20 dark:bg-slate-900/60 dark:text-slate-100"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-rose-700 dark:text-rose-300">
                  {m.time}
                </span>
                <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300">
                  {m.parentSport}
                </span>
              </div>
              <div className="mt-1 line-clamp-2 font-medium leading-snug">
                {m.teams || m.event}
              </div>
              <div className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                <span>{m.round}</span>
                {m.venue && (
                  <>
                    <span>·</span>
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {sorted.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-full border border-rose-500/30 bg-white/60 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-500/10 dark:border-rose-400/30 dark:bg-slate-900/40 dark:text-rose-300"
        >
          {expanded
            ? "ย่อรายการ"
            : `แสดงทั้งหมด (${sorted.length - VISIBLE_COUNT}+)`}
        </button>
      )}
    </section>
  );
}
