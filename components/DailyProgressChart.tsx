"use client";

import type { OverviewDailyRow } from "@/lib/types";
import { formatThaiShort } from "@/lib/date";
import { Activity, CalendarDays } from "lucide-react";

interface Props {
  daily: OverviewDailyRow[];
  todayBE: string;
}

/** Stacked bar chart (CSS only): finished / live / pending per competition day. */
export default function DailyProgressChart({ daily, todayBE }: Props) {
  const maxTotal = daily.reduce((max, d) => Math.max(max, d.total), 0) || 1;

  return (
    <section
      aria-label="ปริมาณการแข่งขันรายวัน"
      className="rounded-2xl border border-slate-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <CalendarDays size={16} className="text-sky-500" />
          ปริมาณการแข่งขันรายวัน
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            จบแล้ว
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500" />
            กำลังแข่ง
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-400 dark:bg-slate-500" />
            รอแข่ง
          </span>
        </div>
      </header>

      <div className="relative">
        <div className="grid grid-flow-col auto-cols-fr items-end gap-2 sm:gap-3">
          {daily.map((d) => {
            const isToday = d.dateBE === todayBE;
            const heightPct = (d.total / maxTotal) * 100;
            const finishedPct = d.total ? (d.finished / d.total) * 100 : 0;
            const livePct = d.total ? (d.live / d.total) * 100 : 0;
            const pendingPct = 100 - finishedPct - livePct;
            const progress = d.total
              ? Math.round((d.finished / d.total) * 100)
              : 0;

            return (
              <div
                key={d.dateBE}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {d.total.toLocaleString("th-TH")}
                </div>

                <div
                  className={[
                    "relative h-32 w-full overflow-hidden rounded-md border bg-slate-100 transition-all sm:h-40 dark:bg-slate-800",
                    isToday
                      ? "border-sky-500 ring-1 ring-sky-500/40"
                      : "border-slate-900/10 dark:border-white/10",
                  ].join(" ")}
                  title={`${formatThaiShort(d.dateBE)} — รวม ${d.total.toLocaleString("th-TH")} | จบ ${d.finished} | LIVE ${d.live} | รอแข่ง ${d.pending} | ชิงเหรียญ ${d.finals}`}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 flex flex-col-reverse"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div
                      className="bg-emerald-500/90"
                      style={{ height: `${finishedPct}%` }}
                    />
                    <div
                      className="bg-rose-500/90"
                      style={{ height: `${livePct}%` }}
                    />
                    <div
                      className="bg-slate-400/70 dark:bg-slate-500/70"
                      style={{ height: `${pendingPct}%` }}
                    />
                  </div>

                  {/* {d.finals > 0 && (
                    <span
                      className="absolute right-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-sm"
                      title={`รอบชิงชนะเลิศ ${d.finals} รายการ (จบ ${d.finishedFinals})`}
                    >
                      {d.finishedFinals}/{d.finals}F
                    </span>
                  )} */}

                  {isToday && (
                    <span
                      className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-sky-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
                      title="วันนี้"
                    >
                      {/* <Activity size={9} /> */}
                      วันนี้
                    </span>
                  )}
                </div>

                <div
                  className={`text-[10px] font-medium leading-tight text-center ${
                    isToday
                      ? "text-sky-700 dark:text-sky-300"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {formatThaiShort(d.dateBE).replace(` ${d.dateBE.split("/")[2]}`, "")}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  {progress}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
