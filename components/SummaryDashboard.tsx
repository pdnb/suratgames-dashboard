"use client";

import type { AllOverview, MedalTable } from "@/lib/types";
import { formatThaiShort } from "@/lib/date";
import {
  Activity,
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Hourglass,
  LayoutGrid,
  ListChecks,
  Medal,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import DailyFinalsProgressChart from "./DailyFinalsProgressChart";
import DailyProgressChart from "./DailyProgressChart";
import LiveMatchesPanel from "./LiveMatchesPanel";
import SiteNav from "./SiteNav";
import SportProgressGrid from "./SportProgressGrid";
import TodayFinalsList from "./TodayFinalsList";
import TopMedalsWidget from "./TopMedalsWidget";

/** รีเฟรชข้อมูลอัตโนมัติทุก 5 นาที */
const SWR_REFRESH_MS = 5 * 60_000;

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

interface KpiCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  accent?: "sky" | "emerald" | "rose" | "amber" | "slate";
  className?: string;
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  sky: "from-sky-500/10 to-transparent text-sky-700 dark:text-sky-300",
  emerald:
    "from-emerald-500/10 to-transparent text-emerald-700 dark:text-emerald-300",
  rose: "from-rose-500/10 to-transparent text-rose-700 dark:text-rose-300",
  amber: "from-amber-500/10 to-transparent text-amber-700 dark:text-amber-300",
  slate: "from-slate-400/10 to-transparent text-slate-700 dark:text-slate-300",
};

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  accent = "sky",
  className = "",
}: KpiCardProps) {
  return (
    <article
      className={[
        "relative overflow-hidden rounded-2xl border border-slate-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900",
        className,
      ].join(" ")}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${ACCENTS[accent]} opacity-60`}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {title}
          </p>
          {icon ? <span className="opacity-80">{icon}</span> : null}
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </div>
        {subtitle ? (
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {subtitle}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProgressBar({
  value,
  total,
  className = "",
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        <span>
          <span className="font-mono">{value.toLocaleString("th-TH")}</span> /{" "}
          <span className="font-mono">{total.toLocaleString("th-TH")}</span>
        </span>
        <span className="font-mono text-emerald-700 dark:text-emerald-300">
          {pct}%
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatRelative(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SummaryDashboard() {
  const {
    data: overview,
    error: overviewError,
    isLoading: isLoadingOverview,
    isValidating: isValidatingOverview,
    mutate: mutateOverview,
  } = useSWR<AllOverview>("/api/all-overview", jsonFetcher, {
    refreshInterval: SWR_REFRESH_MS,
    revalidateOnFocus: true,
  });

  const {
    data: medalData,
    error: medalError,
    isLoading: isLoadingMedals,
    mutate: mutateMedals,
  } = useSWR<MedalTable>("/api/medals", jsonFetcher, {
    refreshInterval: SWR_REFRESH_MS,
  });

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = useCallback(() => {
    void mutateOverview();
    void mutateMedals();
  }, [mutateOverview, mutateMedals]);

  const totals = overview?.totals;
  const finishedPct =
    totals && totals.totalMatches > 0
      ? Math.round((totals.finishedMatches / totals.totalMatches) * 100)
      : 0;
  const finalsPct =
    totals && totals.totalFinals > 0
      ? Math.round((totals.finishedFinals / totals.totalFinals) * 100)
      : 0;

  const todayRow = overview?.daily.find(
    (d) => d.dateBE === overview?.todayBE
  );

  const sportsFullyDoneCount = overview
    ? overview.sports.filter((s) => s.total > 0 && s.finished === s.total).length
    : 0;

  const overviewErr = (overviewError as Error) ?? null;
  const showOverviewError = overviewErr && !overview;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SiteNav current="summary" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            <span className="text-sky-700 dark:text-sky-300">
              สุราษฎร์ธานีเกมส์
            </span>{" "}
            กีฬาเยาวชนแห่งชาติครั้งที่ 41
          </h1>
          {overview && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              <CalendarRange size={12} className="-mt-0.5 mr-1 inline" />
              {formatThaiShort(overview.firstDateBE)} —{" "}
              {formatThaiShort(overview.lastDateBE)} · {totals?.totalDays ?? 0}{" "}
              วันแข่งขัน · {totals?.totalSports ?? 0} ชนิดกีฬา
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-full border border-slate-900/10 px-3 py-1 dark:border-white/10">
            อัปเดตล่าสุด{" "}
            <span className="font-mono">
              {formatRelative(overview?.fetchedAt)}
            </span>
          </span>
          <span className="rounded-full border border-slate-900/10 px-3 py-1 dark:border-white/10">
            ตอนนี้{" "}
            <span className="font-mono">
              {now ? now.toLocaleTimeString("th-TH") : "—"}
            </span>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isValidatingOverview || isLoadingOverview}
            className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sky-700 transition hover:bg-sky-500/20 disabled:opacity-60 dark:text-sky-200"
          >
            <RefreshCw
              size={14}
              className={
                isValidatingOverview || isLoadingOverview ? "animate-spin" : ""
              }
            />
            รีเฟรช
          </button>
        </div>
      </header>

      {showOverviewError && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-400/30 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">โหลดข้อมูลภาพรวมไม่สำเร็จ</div>
              <div className="opacity-80">{overviewErr.message}</div>
              <button
                type="button"
                onClick={() => mutateOverview()}
                className="mt-2 rounded-full border border-red-500/40 px-3 py-1 text-xs hover:bg-red-500/10 dark:border-red-300/30"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <section
        aria-label="ตัวชี้วัดหลัก"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        <KpiCard
          title="ชนิดกีฬา"
          value={
            totals
              ? totals.totalSports.toLocaleString("th-TH")
              : isLoadingOverview
                ? "…"
                : "—"
          }
          subtitle={
            overview ? (
              <div className="space-y-2">
                {/* <p>
                  แข่งครบทุกแมตช์{" "}
                  {sportsFullyDoneCount.toLocaleString("th-TH")} /{" "}
                  {overview.totals.totalSports.toLocaleString("th-TH")} ชนิด
                </p> */}
                <ProgressBar
                  value={sportsFullyDoneCount}
                  total={overview.totals.totalSports}
                />
              </div>
            ) : undefined
          }
          icon={<LayoutGrid size={18} />}
          accent="sky"
        />
        <KpiCard
          title="แมตช์รวมทั้งงาน"
          value={
            totals
              ? totals.totalMatches.toLocaleString("th-TH")
              : isLoadingOverview
                ? "…"
                : "—"
          }
          subtitle={
            totals ? (
              <ProgressBar
                value={totals.finishedMatches}
                total={totals.totalMatches}
              />
            ) : undefined
          }
          icon={<ListChecks size={18} />}
          accent="sky"
        />
        <KpiCard
          title="แข่งจบแล้ว"
          value={
            totals
              ? totals.finishedMatches.toLocaleString("th-TH")
              : isLoadingOverview
                ? "…"
                : "—"
          }
          subtitle={
            totals
              ? `${finishedPct}% ของทั้งงาน · เหลือ ${(
                  totals.pendingMatches + totals.liveMatches
                ).toLocaleString("th-TH")}`
              : undefined
          }
          icon={<CheckCircle2 size={18} />}
          accent="emerald"
        />
        <KpiCard
          title="กำลังแข่ง"
          value={
            totals ? (
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600" />
                </span>
                {totals.liveMatches.toLocaleString("th-TH")}
              </span>
            ) : isLoadingOverview ? (
              "…"
            ) : (
              "—"
            )
          }
          subtitle={
            totals
              ? `รอลงแข่ง ${totals.pendingMatches.toLocaleString("th-TH")}`
              : undefined
          }
          icon={<Activity size={18} />}
          accent="rose"
        />
        <KpiCard
          title="รอบชิงเหรียญทอง"
          value={
            totals
              ? `${totals.finishedFinals.toLocaleString("th-TH")} / ${totals.totalFinals.toLocaleString("th-TH")}`
              : isLoadingOverview
                ? "…"
                : "—"
          }
          subtitle={
            totals ? (
              <ProgressBar
                value={totals.finishedFinals}
                total={totals.totalFinals}
              />
            ) : undefined
          }
          icon={<Trophy size={18} />}
          accent="amber"
        />
      </section>

      {/* Today summary + medals */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,34%)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiCard
            title="แมตช์วันนี้"
            value={
              todayRow
                ? todayRow.total.toLocaleString("th-TH")
                : isLoadingOverview
                  ? "…"
                  : "0"
            }
            subtitle={
              todayRow ? (
                <ProgressBar
                  value={todayRow.finished}
                  total={todayRow.total}
                />
              ) : (
                "วันนี้ยังไม่มีแมตช์ในตาราง"
              )
            }
            icon={<Hourglass size={18} />}
            accent="sky"
          />
          <KpiCard
            title="ชิงเหรียญทองวันนี้"
            value={
              overview
                ? `${
                    overview.todayFinals.filter((f) => f.status === "FINISHED")
                      .length
                  } / ${overview.todayFinals.length}`
                : isLoadingOverview
                  ? "…"
                  : "0 / 0"
            }
            subtitle={
              overview && overview.todayFinals.length > 0 ? (
                <ProgressBar
                  value={
                    overview.todayFinals.filter((f) => f.status === "FINISHED")
                      .length
                  }
                  total={overview.todayFinals.length}
                />
              ) : (
                "ไม่มีรอบชิงเหรียญทองในวันนี้"
              )
            }
            icon={<Medal size={18} />}
            accent="amber"
          />

          {overview && (
            <div className="flex flex-col gap-4 sm:col-span-2">
              <DailyFinalsProgressChart
                daily={overview.daily}
                todayBE={overview.todayBE}
              />
              <DailyProgressChart
                daily={overview.daily}
                todayBE={overview.todayBE}
              />
            </div>
          )}

          {/* {overview && overview.totals.liveMatches > 0 && (
            <div className="sm:col-span-2">
              <LiveMatchesPanel matches={overview.liveMatches} />
            </div>
          )} */}

          {/* {overview && (
            <div className="sm:col-span-2">
              <TodayFinalsList
                date={overview.todayBE}
                finals={overview.todayFinals}
              />
            </div>
          )} */}
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

      {/* Sport breakdown */}
      <section className="mt-4">
        {isLoadingOverview && !overview ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/5"
              />
            ))}
          </div>
        ) : overview ? (
          <SportProgressGrid sports={overview.sports} />
        ) : null}
      </section>

      <footer className="mt-10 border-t border-slate-900/10 pt-6 text-center text-sm text-slate-500 dark:border-white/5 dark:text-slate-500">
        {/* ข้อมูลจาก{" "}
        <a
          href={overview?.sourceUrl ?? "https://suratgames.sat.or.th/"}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          suratgames.sat.or.th
        </a> */}
        <p>ออกแบบและพัฒนาโดย <a href="https://cc.sru.ac.th" target="_blank" rel="noreferrer">ศูนย์คอมพิวเตอร์ มหาวิทยาลัยสุราษฎร์ธานี</a> ร่วมกับ <a href="https://www.sat.or.th" target="_blank" rel="noreferrer">ฝ่ายเทคโนโลยีสารสนเทศ การกีฬาแห่งประเทศไทย</a></p>
      </footer>
    </main>
  );
}
