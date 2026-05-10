"use client";

import type { ScheduleGrid, ScheduleGridCell, ScheduleGridSportRow } from "@/lib/types";
import { AlertTriangle, Circle, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import RefreshIndicator from "./RefreshIndicator";
import SiteNav from "./SiteNav";

const REFRESH_MS = 300_000;

function shortDateBE(dateBE: string): string {
  const m = dateBE.match(/^(\d{2})\/(\d{2})\/\d{4}$/);
  return m ? `${m[1]}/${m[2]}` : dateBE;
}

function effectiveCell(
  cell: ScheduleGridCell,
  finalsOnly: boolean
): ScheduleGridCell {
  if (finalsOnly && cell.kind === "compete") {
    return { kind: "none", finalCount: 0 };
  }
  return cell;
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  className?: string;
};

function StatCard({ title, value, subtitle, className = "" }: StatCardProps) {
  return (
    <article
      className={`rounded-2xl border border-slate-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 ${className}`}
    >
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}

const fetcher = async (url: string): Promise<ScheduleGrid> => {
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

function rowEffectiveCounts(s: ScheduleGridSportRow, finalsOnly: boolean) {
  let competeDays = 0;
  let finalDays = 0;
  for (const c of s.cells) {
    const e = effectiveCell(c, finalsOnly);
    if (e.kind === "compete") competeDays++;
    if (e.kind === "final") finalDays++;
  }
  return { competeDays, finalDays };
}

export default function ScheduleGridDashboard() {
  const [search, setSearch] = useState("");
  const [finalsOnly, setFinalsOnly] = useState(false);
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());

  const { data, error, isLoading, isValidating, mutate } = useSWR<ScheduleGrid>(
    "/api/schedule-grid",
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

  const filteredSports = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const usePick = selectedSports.size > 0;
    return data.sports.filter((s) => {
      if (usePick && !selectedSports.has(s.name)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, search, selectedSports]);

  const kpi = useMemo(() => {
    if (!data) {
      return {
        totalSports: 0,
        numDays: 0,
        compete: 0,
        final: 0,
      };
    }
    const numDays = data.dates.length;
    if (filteredSports.length === 0 && (search.trim() || selectedSports.size > 0)) {
      return { totalSports: 0, numDays, compete: 0, final: 0 };
    }
    const rows =
      filteredSports.length > 0 || search.trim() || selectedSports.size > 0
        ? filteredSports
        : data.sports;
    let compete = 0;
    let fin = 0;
    for (const s of rows) {
      for (const c of s.cells) {
        const e = effectiveCell(c, finalsOnly);
        if (e.kind === "compete") compete++;
        if (e.kind === "final") fin++;
      }
    }
    return {
      totalSports: rows.length,
      numDays,
      compete,
      final: fin,
    };
  }, [data, filteredSports, finalsOnly, search, selectedSports]);

  const columnTotals = useMemo(() => {
    if (!data) return { compete: [] as number[], final: [] as number[] };
    const n = data.dates.length;
    const compete = Array.from({ length: n }, () => 0);
    const final = Array.from({ length: n }, () => 0);
    const rows =
      filteredSports.length > 0 || search.trim() || selectedSports.size > 0
        ? filteredSports
        : data.sports;
    for (const s of rows) {
      s.cells.forEach((c, i) => {
        const e = effectiveCell(c, finalsOnly);
        if (e.kind === "compete") compete[i]++;
        if (e.kind === "final") final[i]++;
      });
    }
    return { compete, final };
  }, [data, filteredSports, finalsOnly, search, selectedSports]);

  const sportsForPicker = data?.sports ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-900/10 bg-blue-900/5 px-3 py-1 text-xs text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
              <Trophy size={12} />
              สุราษฎร์ธานีเกมส์{" "}
              <span className="opacity-60">•</span> กีฬาเยาวชนแห่งชาติครั้งที่
              41
            </div>
            <SiteNav current="grid" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              ตารางการแข่งขัน{" "}
              <span className="text-sky-700 dark:text-sky-300">
                (กีฬา × วันที่)
              </span>
            </h1>
            {data?.dates?.length ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ช่วงวันที่ {data.dates[0]} — {data.dates[data.dates.length - 1]}{" "}
                (พ.ศ.)
              </p>
            ) : null}
          </div>
          <RefreshIndicator
            fetchedAt={data?.fetchedAt ?? null}
            refreshIntervalMs={REFRESH_MS}
            isValidating={isValidating}
            onRefresh={() => mutate()}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="ชนิดกีฬา (ที่แสดง)"
            value={kpi.totalSports.toLocaleString("th-TH")}
          />
          <StatCard
            title="จำนวนวันในตาราง"
            value={kpi.numDays.toLocaleString("th-TH")}
          />
          <StatCard
            title="ช่องแข่งขัน (ไอคอนตาราง)"
            value={kpi.compete.toLocaleString("th-TH")}
          />
          <StatCard
            title="ช่องวันชิงเหรียญ (F)"
            value={kpi.final.toLocaleString("th-TH")}
          />
        </div>
      </header>

      <section className="mb-4 space-y-3 rounded-2xl border border-slate-900/10 bg-slate-900/2 p-4 dark:border-white/10 dark:bg-white/2">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            ค้นหาชื่อกีฬา
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="เช่น ว่ายน้ำ, ฟุตบอล…"
              className="rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500/30 focus:ring-2 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={finalsOnly}
              onChange={(e) => setFinalsOnly(e.target.checked)}
              className="size-4 rounded border-slate-400 text-sky-600 focus:ring-sky-500"
            />
            เฉพาะวันชิงเหรียญ (ซ่อนไอคอนตารางธรรมดา)
          </label>
          {selectedSports.size > 0 ? (
            <button
              type="button"
              onClick={handleClearSports}
              className="rounded-full border border-slate-900/15 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              ล้างการเลือกกีฬา ({selectedSports.size})
            </button>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            เลือกชนิดกีฬา (คลิกซ้ำเพื่อยกเลิก — ว่าง = แสดงทั้งหมด)
          </p>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {sportsForPicker.map((s) => {
              const on = selectedSports.has(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleToggleSport(s.name)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                    on
                      ? "border-sky-500/50 bg-sky-500/15 text-sky-900 dark:border-sky-400/40 dark:text-sky-100"
                      : "border-slate-900/10 text-slate-600 hover:border-slate-900/25 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

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
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-slate-900/5 bg-slate-900/5 dark:border-white/5 dark:bg-white/5"
            />
          ))}
        </div>
      )}

      {data && filteredSports.length === 0 && (
        <div className="rounded-2xl border border-slate-900/10 bg-slate-900/5 p-10 text-center text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <Trophy size={28} className="mx-auto mb-2 opacity-40" />
          <p>ไม่มีกีฬาที่ตรงกับตัวกรอง — ลองล้างการค้นหาหรือการเลือกกีฬา</p>
        </div>
      )}

      {data && filteredSports.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-900/10 shadow-sm dark:border-white/10">
          <table className="w-max min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-900/10 bg-amber-500/90 text-white dark:border-white/10 dark:bg-amber-600/90">
                <th
                  scope="col"
                  className="sticky left-0 z-20 min-w-40 border-r border-white/20 bg-amber-500/95 px-2 py-2 font-semibold dark:bg-amber-600/95"
                >
                  ชนิดกีฬา
                </th>
                {data.dates.map((d) => (
                  <th
                    key={d}
                    scope="col"
                    className="w-12 min-w-12 border-r border-white/15 px-0.5 py-2 text-center font-semibold last:border-r-0"
                  >
                    <Link
                      href={`/daily?date=${encodeURIComponent(d)}`}
                      className="block text-white underline-offset-2 hover:underline"
                    >
                      {shortDateBE(d)}
                    </Link>
                  </th>
                ))}
                <th
                  scope="col"
                  className="min-w-18 whitespace-nowrap px-2 py-2 text-center text-[10px] font-semibold leading-tight"
                >
                  แข่ง / F
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSports.map((s: ScheduleGridSportRow) => {
                const { competeDays: rowC, finalDays: rowF } = rowEffectiveCounts(
                  s,
                  finalsOnly
                );
                return (
                <tr
                  key={s.name}
                  className="border-b border-slate-900/10 odd:bg-white even:bg-slate-50/80 dark:border-white/10 dark:odd:bg-slate-900 dark:even:bg-slate-900/70"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-slate-900/10 bg-inherit px-2 py-1.5 text-left font-medium text-slate-800 dark:border-white/10 dark:text-slate-100"
                  >
                    <span className="line-clamp-2">{s.name}</span>
                  </th>
                  {data.dates.map((d, colIdx) => {
                    const raw = s.cells[colIdx] ?? {
                      kind: "none" as const,
                      finalCount: 0,
                    };
                    const cell = effectiveCell(raw, finalsOnly);
                    const href = `/daily?date=${encodeURIComponent(d)}`;
                    const inner =
                      cell.kind === "none" ? (
                        <span className="text-slate-300 dark:text-slate-600">
                          ·
                        </span>
                      ) : cell.kind === "compete" ? (
                        <span
                          className="inline-flex items-center justify-center text-sky-600 dark:text-sky-400"
                          title="มีการแข่งขัน"
                        >
                          <Circle size={10} fill="currentColor" />
                        </span>
                      ) : (
                        <span
                          className="inline-flex min-w-5 items-center justify-center rounded bg-amber-500/90 px-1 font-bold text-white dark:bg-amber-600"
                          title="วันชิงเหรียญทอง"
                        >
                          F
                          {cell.finalCount > 1 ? cell.finalCount : ""}
                        </span>
                      );
                    return (
                      <td
                        key={`${s.name}-${d}`}
                        className="border-r border-slate-900/10 px-0.5 py-1 text-center align-middle dark:border-white/10"
                      >
                        {cell.kind === "none" ? (
                          inner
                        ) : (
                          <Link
                            href={href}
                            className="flex min-h-8 items-center justify-center rounded-md hover:bg-sky-500/10 dark:hover:bg-sky-400/10"
                          >
                            {inner}
                          </Link>
                        )}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap px-2 py-1 text-center text-[10px] text-slate-600 dark:text-slate-400">
                    {rowC} / {rowF}
                  </td>
                </tr>
              );
              })}
              <tr className="border-t-2 border-slate-900/20 bg-slate-100 font-semibold dark:border-white/20 dark:bg-slate-800">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-slate-900/10 bg-slate-100 px-2 py-2 text-left dark:border-white/10 dark:bg-slate-800"
                >
                  รวม (แถวที่แสดง)
                </th>
                {data.dates.map((d, i) => (
                  <td
                    key={`tot-${d}`}
                    className="border-r border-slate-900/10 px-1 py-2 text-center text-[10px] leading-tight dark:border-white/10"
                  >
                    <span className="text-sky-700 dark:text-sky-300">
                      {columnTotals.compete[i] ?? 0}
                    </span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-amber-700 dark:text-amber-300">
                      {columnTotals.final[i] ?? 0}
                    </span>
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-slate-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-8 space-y-2 border-t border-slate-900/10 pt-6 text-xs text-slate-500 dark:border-white/5 dark:text-slate-500">
        <p>
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            F
          </span>{" "}
          = วันที่มีการชิงเหรียญทอง (ตามคำอธิบายบนเว็บต้นทาง) ·{" "}
          <Circle
            size={8}
            className="inline align-baseline text-sky-600"
            fill="currentColor"
          />{" "}
          = วันแข่งขันทั่วไป (ไอคอนตาราง)
        </p>
        <p>
          ข้อมูลจาก suratgames.sat.or.th • รีเฟรชอัตโนมัติทุก {REFRESH_MS / 1000}{" "}
          วินาที
        </p>
      </footer>
    </main>
  );
}
