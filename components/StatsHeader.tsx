import type { ScheduleStats } from "@/lib/types";
import {
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Medal,
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
  tone?:
    | "default"
    | "live"
    | "finished"
    | "pending"
    | "primary"
    | "championship";
}

function StatCard({ icon: Icon, label, value, tone = "default" }: CardProps) {
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
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">
          {label}
        </span>
        <Icon size={16} className="opacity-80" />
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export default function StatsHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <StatCard
        icon={Layers}
        label="ชนิดกีฬา"
        value={stats.totalSports}
        tone="primary"
      />
      <StatCard
        icon={Activity}
        label="รายการทั้งหมด"
        value={stats.totalMatches}
      />
      <StatCard
        icon={Trophy}
        label="รอบชิงชนะเลิศ"
        value={stats.championshipMatchCount}
        tone="championship"
      />
      {/* <StatCard
        icon={Medal}
        label="เหรียญทอง (ตามรายการชิง)"
        value={stats.goldMedalEvents}
        tone="primary"
      /> */}
      <StatCard
        icon={Radio}
        label="กำลังแข่ง"
        value={stats.liveMatches}
        tone="live"
      />
      <StatCard
        icon={CheckCircle2}
        label="จบแล้ว"
        value={stats.finishedMatches}
        tone="finished"
      />
      <StatCard
        icon={Clock}
        label="รอแข่ง"
        value={stats.pendingMatches}
        tone="pending"
      />
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
