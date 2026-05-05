import type { MatchStatus } from "@/lib/types";
import { CheckCircle2, Clock, Radio } from "lucide-react";

interface Props {
  status: MatchStatus;
  size?: "sm" | "md";
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  LIVE: "กำลังแข่ง",
  FINISHED: "จบแล้ว",
  PENDING: "รอแข่ง",
};

export default function StatusBadge({ status, size = "sm" }: Props) {
  const isLive = status === "LIVE";
  const isFinished = status === "FINISHED";

  const base =
    "inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap";
  const sz = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  const cls = isLive
    ? "border-red-500/50 bg-red-500/15 text-red-700 live-pulse dark:border-red-400/40 dark:text-red-300"
    : isFinished
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300"
      : "border-slate-500/40 bg-slate-500/15 text-slate-700 dark:border-slate-500/30 dark:text-slate-300";

  const Icon = isLive ? Radio : isFinished ? CheckCircle2 : Clock;

  return (
    <span className={`${base} ${sz} ${cls}`}>
      <Icon size={size === "md" ? 14 : 12} />
      {STATUS_LABEL[status]}
    </span>
  );
}
