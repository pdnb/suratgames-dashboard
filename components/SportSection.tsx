"use client";

import type { MatchLayoutMode } from "@/lib/match-layout";
import type { Match, Sport } from "@/lib/types";
import { ChevronDown, ChevronUp, Radio, Star } from "lucide-react";
import { useState } from "react";
import MatchRow from "./MatchRow";

interface Props {
  sport: Sport;
  matches: Match[];
  layout: MatchLayoutMode;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const STATUS_ORDER: Record<Match["status"], number> = {
  LIVE: 0,
  PENDING: 1,
  FINISHED: 2,
};

export default function SportSection({
  sport,
  matches,
  layout,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const sorted = [...matches].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    return a.time.localeCompare(b.time);
  });

  const live = matches.filter((m) => m.status === "LIVE").length;
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  const pending = matches.filter((m) => m.status === "PENDING").length;

  return (
    <section
      className={`rounded-2xl border bg-[var(--color-bg-soft)]/70 backdrop-blur-sm ${
        live > 0
          ? "border-red-500/40 dark:border-red-400/30"
          : "border-slate-900/10 dark:border-white/10"
      }`}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          aria-label={
            isFavorite ? `เลิกชอบ ${sport.name}` : `ถูกใจ ${sport.name}`
          }
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className={`flex shrink-0 items-center justify-center pl-3 pr-1 py-4 text-slate-500 transition hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-300 ${
            isFavorite
              ? "text-amber-600 dark:text-amber-400"
              : ""
          }`}
        >
          <Star
            size={18}
            strokeWidth={isFavorite ? 0 : 2}
            className={
              isFavorite
                ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                : ""
            }
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 py-4 pr-5 text-left sm:pl-1"
        >
          <div className="flex min-w-0 items-center gap-3">
            {live > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-700 live-pulse dark:text-red-300">
                <Radio size={12} />
                Running {live}
              </span>
            )}
            <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {sport.name}
            </h2>
            <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
              {matches.length} / {sport.total} รายการ
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">
              <span className="text-emerald-600 dark:text-emerald-400">
                {finished}
              </span>
              <span className="opacity-60"> จบ</span>
              {" · "}
              <span className="text-slate-700 dark:text-slate-300">
                {pending}
              </span>
              <span className="opacity-60"> รอ</span>
            </span>
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-slate-900/10 p-5 pt-4 dark:border-white/5">
          {sorted.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              ไม่ตรงกับตัวกรอง
            </p>
          ) : (
            <div
              className={
                layout === "grid"
                  ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-2"
              }
            >
              {sorted.map((m) => (
                <MatchRow key={m.id} match={m} variant={layout} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
