"use client";

import type { OverviewSportRow } from "@/lib/types";
import { ListChecks, Medal } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  sports: OverviewSportRow[];
}

type SortKey = "total" | "progress" | "finals" | "live" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "total", label: "รายการมาก→น้อย" },
  { value: "progress", label: "% เสร็จมาก→น้อย" },
  { value: "finals", label: "ชิงเหรียญ" },
  { value: "live", label: "กำลังแข่ง" },
  { value: "name", label: "ชื่อ ก-ฮ" },
];

function progressPct(s: OverviewSportRow): number {
  if (!s.total) return 0;
  return Math.round((s.finished / s.total) * 100);
}

function goldPct(s: OverviewSportRow): number {
  if (!s.finals) return 0;
  return Math.round((s.finishedFinals / s.finals) * 100);
}

export default function SportProgressGrid({ sports }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    let list = sports;
    if (q) {
      list = list.filter((s) => s.name.includes(q));
    }
    const sorted = [...list];
    switch (sortKey) {
      case "progress":
        sorted.sort((a, b) => progressPct(b) - progressPct(a));
        break;
      case "finals":
        sorted.sort((a, b) => b.finals - a.finals);
        break;
      case "live":
        sorted.sort((a, b) => b.live - a.live || b.total - a.total);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "th"));
        break;
      default:
        sorted.sort((a, b) => b.total - a.total);
    }
    return sorted;
  }, [sports, sortKey, query]);

  return (
    <section
      aria-label="สรุปต่อชนิดกีฬา"
      className="rounded-2xl border border-slate-900/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <ListChecks size={16} className="text-emerald-500" />
          ความคืบหน้าต่อชนิดกีฬา
          <span className="ml-1 rounded-full bg-slate-900/5 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {sports.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชนิดกีฬา…"
            className="w-40 rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs text-slate-900 outline-none focus:border-sky-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs text-slate-700 outline-none focus:border-sky-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
            aria-label="จัดเรียง"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => {
          const pct = progressPct(s);
          const gold = goldPct(s);
          return (
            <article
              key={s.name}
              className={[
                "relative rounded-xl border p-3 transition",
                s.live > 0
                  ? "border-rose-500/40 bg-rose-500/5 dark:border-rose-400/30 dark:bg-rose-500/10"
                  : "border-slate-900/10 bg-slate-50/60 dark:border-white/10 dark:bg-white/5",
              ].join(" ")}
              title={`${s.name} — รวม ${s.total} | จบ ${s.finished} | LIVE ${s.live} | รอ ${s.pending} | ชิงเหรียญ ${s.finishedFinals}/${s.finals}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {s.name}
                </h3>
                {s.live > 0 && (
                  <span className="shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    กำลังแข่ง {s.live}
                  </span>
                )}
              </div>

              {s.finals > 0 && (
                <>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
                    <span className="inline-flex items-baseline gap-1 font-medium">
                      <Medal size={14} className="text-amber-600 dark:text-amber-400" />
                      <span className="font-mono text-xl">{s.finishedFinals}</span> /{" "}
                      <span className="font-mono text-xs">{s.finals}</span>
                    </span>
                    <span className="font-mono text-xs">{gold}%</span>
                  </div>
                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-amber-500/15 dark:bg-amber-500/20"
                    aria-label={`ชิงเหรียญทองคืบหน้า ${gold}%`}
                  >
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${gold}%` }}
                    />
                  </div>
                </>
              )}
              

              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-50">
                  {s.finished.toLocaleString("th-TH")}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  / {s.total.toLocaleString("th-TH")}
                </span>
                <span className="ml-auto font-mono text-xs text-emerald-700 dark:text-emerald-300">
                  {pct}%
                </span>
              </div>

              <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60"
                aria-label={`คืบหน้า ${pct}%`}
              >
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>


              {/* <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
                รอแข่ง{" "}
                <span className="font-mono">
                  {s.pending.toLocaleString("th-TH")}
                </span>
              </div> */}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-slate-900/10 bg-slate-900/5 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            ไม่พบชนิดกีฬาที่ตรงกับ "{query}"
          </div>
        )}
      </div>
    </section>
  );
}
