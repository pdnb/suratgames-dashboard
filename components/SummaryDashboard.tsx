"use client";

import type { MedalTable, ScheduleFinal } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import useSWR from "swr";
import TopMedalsWidget from "./TopMedalsWidget";

type SummaryStatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  className?: string;
  /** Smaller padding and value text for dense grids */
  compact?: boolean;
};

function SummaryStatCard({
  title,
  value,
  subtitle,
  className = "",
  compact = false,
}: SummaryStatCardProps) {
  const padding = compact ? "p-3" : "p-4";
  const valueSize = compact
    ? "mt-2 text-2xl font-bold tracking-tight"
    : "mt-3 text-3xl font-bold tracking-tight";
  return (
    <article
      className={`rounded-2xl border border-slate-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 ${padding} ${className}`}
    >
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </p>
      <p className={`${valueSize} text-slate-900 dark:text-slate-50`}>{value}</p>
      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}

async function jsonFetcher<T>(url: string): Promise<T> {
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
}

function formatScheduleStat(
  n: number | undefined,
  data: ScheduleFinal | undefined,
  isLoading: boolean,
  error: Error | null
): string {
  if (error && !data) return "—";
  if (isLoading && !data) return "…";
  if (n == null) return "—";
  return n.toLocaleString("th-TH");
}

const SPORT_SKELETON_COUNT = 12;

export default function SummaryDashboard() {
  const {
    data: medalData,
    error: medalError,
    isLoading: isLoadingMedals,
    mutate: mutateMedals,
  } = useSWR<MedalTable>("/api/medals", jsonFetcher);

  const {
    data: scheduleFinal,
    error: scheduleError,
    isLoading: isLoadingSchedule,
    mutate: mutateScheduleFinal,
  } = useSWR<ScheduleFinal>("/api/schedule-final", jsonFetcher);

  const totalSports = scheduleFinal?.totalSports;
  const totalMedals = scheduleFinal?.totalMedals;

  const sportsDenom = formatScheduleStat(
    totalSports,
    scheduleFinal,
    isLoadingSchedule,
    (scheduleError as Error) ?? null
  );

  const medalsTotalStr = formatScheduleStat(
    totalMedals,
    scheduleFinal,
    isLoadingSchedule,
    (scheduleError as Error) ?? null
  );

  const scheduleErr = (scheduleError as Error) ?? null;
  const showScheduleSportsError =
    scheduleErr && !scheduleFinal && !isLoadingSchedule;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            <span className="ml-2 text-sky-700 dark:text-sky-300">
              สุราษฎร์ธานีเกมส์
            </span>{" "}
            กีฬาเยาวชนแห่งชาติครั้งที่ 41
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,34%)] lg:items-stretch">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SummaryStatCard
              title="กีฬา"
              value={sportsDenom}
              className="min-h-36"
            />
            <SummaryStatCard
              title="เสร็จแล้ว"
              value={`xx / ${sportsDenom}`}
              className="min-h-36"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryStatCard title="เหรียญรวม" value={medalsTotalStr} />
            <SummaryStatCard title="เสร็จแล้ว" value="xx" />
            <SummaryStatCard title="รายการแข่งขันรวม" value="6,xxx" />
            <SummaryStatCard title="แข่งขันเสร็จแล้ว" value="xx" />
          </div>

          <section aria-label="รายการชิงเหรียญตามชนิดกีฬา">
            {isLoadingSchedule && !scheduleFinal && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: SPORT_SKELETON_COUNT }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 animate-pulse rounded-2xl border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/5"
                  />
                ))}
              </div>
            )}

            {showScheduleSportsError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-400/30 dark:text-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">
                      โหลดตารางสรุปการชิงเหรียญไม่สำเร็จ
                    </div>
                    <div className="opacity-80">{scheduleErr.message}</div>
                    <button
                      type="button"
                      onClick={() => mutateScheduleFinal()}
                      className="mt-2 rounded-full border border-red-500/40 px-3 py-1 text-xs hover:bg-red-500/10 dark:border-red-300/30"
                    >
                      ลองใหม่
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scheduleFinal && scheduleFinal.sports.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {scheduleFinal.sports.map((s) => (
                  <SummaryStatCard
                    key={s.name}
                    title={s.name}
                    value={`xx / ${s.total.toLocaleString("th-TH")}`}
                    compact
                    className="min-h-22"
                  />
                ))}
              </div>
            )}

            {!isLoadingSchedule &&
              !scheduleErr &&
              scheduleFinal &&
              scheduleFinal.sports.length === 0 && (
                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/5 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  ยังไม่มีข้อมูลกีฬาในตารางสรุป
                </div>
              )}
          </section>
        </div>

        <TopMedalsWidget
          data={medalData}
          isLoading={isLoadingMedals}
          error={(medalError as Error) ?? null}
          onRetry={() => mutateMedals()}
          title="10 อันดับเหรียญรางวัล"
          maxRows={10}
          className="h-full min-h-0 lg:min-h-[500px]"
        />
      </section>
    </main>
  );
}
