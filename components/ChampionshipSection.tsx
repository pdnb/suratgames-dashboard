import type { ChampionshipSummaryRow } from "@/lib/types";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  rows: ChampionshipSummaryRow[];
}

interface ChampionshipGroup {
  sport: string;
  items: ChampionshipSummaryRow[];
  count: number;
}

export default function ChampionshipSection({ rows }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const groupedRows = useMemo<ChampionshipGroup[]>(() => {
    const bySport = new Map<string, ChampionshipSummaryRow[]>();
    for (const row of rows) {
      const items = bySport.get(row.sport);
      if (items) items.push(row);
      else bySport.set(row.sport, [row]);
    }

    return Array.from(bySport.entries())
      .map(([sport, items]) => ({
        sport,
        items: items.sort((a, b) => a.time.localeCompare(b.time)),
        count: items.length,
      }))
      .sort((a, b) => b.count - a.count || a.sport.localeCompare(b.sport, "th"));
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <section
      className="mb-5 rounded-2xl border border-amber-500/35 bg-amber-500/8 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/7 dark:text-amber-100"
      aria-label="รายการรอบชิงชนะเลิศ"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
            <Trophy size={12} />
            FINAL
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            รอบชิงชนะเลิศ
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {rows.length} รายการ
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">{groupedRows.length} ชนิดกีฬา</span>
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      {!collapsed && (
        <div className="border-t border-slate-900/10 p-5 pt-4 dark:border-white/5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groupedRows.map((group) => (
              <article
                key={group.sport}
                className="rounded-xl border border-slate-900/10 bg-white/60 p-3 dark:border-white/10 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {group.sport}
                  </h3>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium border-amber-500/35 bg-amber-500/8 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/7 dark:text-amber-100">
                    {group.count} รายการ
                  </span>
                </div>

                {/* <ul className="space-y-1.5">
                  {group.items.map((item, idx) => (
                    <li
                      key={`${group.sport}-${item.time}-${item.event}-${idx}`}
                      className="rounded-lg border border-slate-900/10 bg-white/65 px-2.5 py-2 text-xs dark:border-white/10 dark:bg-slate-900/40"
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {item.event}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-slate-600 dark:text-slate-300">
                        <span>{item.round}</span>
                        {item.time ? (
                          <span className="font-mono tabular-nums">{item.time}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul> */}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
