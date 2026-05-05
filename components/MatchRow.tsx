import type { Match } from "@/lib/types";
import { ExternalLink, FileText, MapPin, Trophy } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface Props {
  match: Match;
}

export default function MatchRow({ match }: Props) {
  const isLive = match.status === "LIVE";

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isLive
          ? "border-red-500/50 bg-red-500/5 shadow-[0_0_0_1px_rgba(239,68,68,0.15)] dark:border-red-400/50"
          : "border-slate-900/10 bg-[var(--color-surface)]/60 hover:border-slate-900/20 hover:bg-[var(--color-surface-2)]/70 dark:border-white/5 dark:hover:border-white/10"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-semibold tabular-nums text-sky-700 dark:text-sky-300">
            {match.time || "—"}
          </span>
          {match.round && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {match.round}
            </span>
          )}
        </div>
        <StatusBadge status={match.status} />
      </div>

      <h3 className="mb-2 text-[15px] leading-snug text-slate-900 dark:text-slate-100">
        {match.event || "—"}
      </h3>

      {match.venue && (
        <div className="mb-3 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          {match.venueUrl ? (
            <a
              href={match.venueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-700 hover:underline dark:hover:text-sky-300"
            >
              {match.venue}
            </a>
          ) : (
            <span>{match.venue}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {match.startListUrl && (
          <a
            href={match.startListUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 bg-slate-900/5 px-2.5 py-1 text-xs text-slate-700 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
          >
            <FileText size={12} />
            Start List
            <ExternalLink size={10} className="opacity-60" />
          </a>
        )}
        {match.resultUrl && (
          <a
            href={match.resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-700 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 dark:border-emerald-400/20 dark:text-emerald-300 dark:hover:border-emerald-400/40"
          >
            <Trophy size={12} />
            ผลการแข่งขัน
            <ExternalLink size={10} className="opacity-60" />
          </a>
        )}
        {match.id && (
          <span className="ml-auto rounded-md bg-slate-900/5 px-2 py-1 font-mono text-[10px] tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-500">
            {match.id}
          </span>
        )}
      </div>
    </div>
  );
}
