import type { ScheduleStats } from "@/lib/types";
import {
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Radio,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  stats: ScheduleStats;
}

interface CardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  valueLabel?: string;
  tone?:
    | "default"
    | "live"
    | "finished"
    | "pending"
    | "primary"
    | "championship";
  /** Shown below the label row (e.g. “Live” on the live card). */
  subLabel?: string;
  /** Appended after the main value with slightly smaller type (e.g. “แห่ง”). */
  valueSuffix?: string;
  /** Optional second value shown as `/ <label> <value>`. */
  secondaryValue?: number | string;
  secondaryLabel?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueLabel,
  tone = "default",
  subLabel,
  valueSuffix,
  secondaryValue,
  secondaryLabel,
}: CardProps) {
  const toneCls =
    tone === "live"
      ? "border-red-500/40 bg-red-500/10 text-red-700 dark:border-red-400/40 dark:text-red-300"
      : tone === "finished"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300"
        : tone === "pending"
          ? "border-slate-400/40 bg-slate-500/10 text-slate-700 dark:border-slate-400/20 dark:text-slate-300"
          : tone === "championship"
            ? "border-amber-500/35 bg-amber-500/8 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/7 dark:text-amber-100"
            : tone === "primary"
              ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:text-sky-200"
              : "border-slate-900/10 bg-slate-900/5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200";

  return (
    <div className={`rounded-2xl border p-4 ${toneCls}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">
            {label}
          </span>
          {subLabel ? (
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide opacity-90">
              {subLabel}
            </div>
          ) : null}
        </div>
        <Icon size={16} className="mt-0.5 shrink-0 opacity-80" />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-0">
        {valueLabel ? (
          <span className="text-sm font-semibold opacity-90">{valueLabel}</span>
        ) : null}
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {valueSuffix ? (
          <span className="text-xl font-semibold tabular-nums opacity-90">
            {valueSuffix}
          </span>
        ) : null}
        {secondaryValue !== undefined ? (
          <>
            <span className="px-1 text-base font-semibold opacity-75">/</span>
            {secondaryLabel ? (
              <span className="text-sm font-semibold opacity-90">
                {secondaryLabel}
              </span>
            ) : null}
            <span className="text-2xl font-bold tabular-nums">
              {secondaryValue}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function StatsHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 sm:col-span-4 md:col-span-3">
        <StatCard
          icon={Layers}
          label="ชนิดกีฬา"
          value={stats.totalSports}
          tone="primary"
        />
      </div>
      <div className="col-span-12 sm:col-span-9 md:col-span-9">
        <StatCard
          icon={Trophy}
          label="รอบชิงชนะเลิศ"
          value={stats.championshipMatchCount}
          valueLabel="ทั้งหมด"
          secondaryLabel="ชิงแล้ว"
          secondaryValue={stats.finishedChampionshipMatchCount}
          tone="championship"
        />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <StatCard
          icon={Radio}
          label="กำลังแข่ง"
          value={stats.liveMatches}
          tone="live"
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          icon={Clock}
          label="รอแข่ง"
          value={stats.pendingMatches}
          tone="pending"
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          icon={CheckCircle2}
          label="จบแล้ว"
          value={stats.finishedMatches}
          tone="finished"
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard
          icon={Activity}
          label="ทั้งหมด"
          value={stats.totalMatches}
        />
      </div>
    </div>
  );
}

export function HeroBadge({ stats }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900/5 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      <Trophy size={12} />
      สุราษฎร์ธานีเกมส์ • กีฬาเยาวชนแห่งชาติครั้งที่ 41
      <span className="opacity-60">•</span>
      <span className="font-mono">{stats.totalMatches} รายการ</span>
    </div>
  );
}
