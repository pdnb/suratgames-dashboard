"use client";

import type { OverviewTodayFinal } from "@/lib/types";
import { formatThaiLong } from "@/lib/date";
import { CheckCircle2, Clock, MapPin, Medal } from "lucide-react";

interface Props {
  date: string;
  finals: OverviewTodayFinal[];
}

const STATUS_STYLE: Record<
  OverviewTodayFinal["status"],
  { label: string; cls: string }
> = {
  FINISHED: {
    label: "จบแล้ว",
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  LIVE: {
    label: "กำลังแข่ง",
    cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  PENDING: {
    label: "รอแข่ง",
    cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
};

export default function TodayFinalsList({ date, finals }: Props) {
  const finished = finals.filter((f) => f.status === "FINISHED").length;
  const total = finals.length;

  return (
    <section
      aria-label="รอบชิงเหรียญทองวันนี้"
      className="rounded-2xl border border-amber-500/30 bg-amber-50/40 p-4 shadow-sm dark:border-amber-300/30 dark:bg-amber-500/10"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
          <Medal size={16} className="text-amber-600 dark:text-amber-300" />
          ชิงเหรียญทองวันนี้
          <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] text-amber-800 dark:text-amber-200">
            {finished}/{total}
          </span>
        </div>
        <span className="text-[11px] text-amber-800/80 dark:text-amber-200/80">
          {formatThaiLong(date)}
        </span>
      </header>

      {total === 0 ? (
        <p className="rounded-xl bg-white/70 px-3 py-4 text-center text-xs text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
          ไม่มีรอบชิงเหรียญทองในวันนี้
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {finals.map((f, i) => {
            const style = STATUS_STYLE[f.status];
            return (
              <li
                key={`${f.time}-${f.event}-${i}`}
                className="rounded-xl border border-amber-500/20 bg-white/85 p-3 text-xs text-slate-800 shadow-sm dark:border-amber-300/20 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-amber-800 dark:text-amber-200">
                    <Clock size={11} />
                    {f.time || "—"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.cls}`}
                  >
                    {f.status === "FINISHED" && (
                      <CheckCircle2 size={10} className="-mt-0.5 inline" />
                    )}{" "}
                    {style.label}
                  </span>
                </div>
                <div className="mt-1 line-clamp-2 font-semibold leading-snug">
                  {f.event}
                </div>
                {f.teams && (
                  <div className="mt-1 truncate text-[11px] text-slate-600 dark:text-slate-300">
                    {f.teams}
                  </div>
                )}
                {f.venue && (
                  <div className="mt-1 inline-flex items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{f.venue}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
