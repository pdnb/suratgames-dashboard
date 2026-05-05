import type { MedalTable } from "@/lib/types";
import { AlertTriangle, Medal, Trophy } from "lucide-react";

interface Props {
  data?: MedalTable;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  /** Section heading; default matches previous “Top 10” behavior. */
  title?: string;
  /** Max provinces to list (default 10). */
  maxRows?: number;
  className?: string;
}

export default function TopMedalsWidget({
  data,
  isLoading,
  error,
  onRetry,
  title = "Top 10 เหรียญทอง",
  maxRows = 10,
  className,
}: Props) {
  const rows = data?.rows?.slice(0, maxRows) ?? [];

  return (
    <section
      className={[
        "flex min-h-0 flex-col rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/40",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={title}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <Trophy size={16} className="shrink-0 text-amber-500" />
          <span className="truncate">{title}</span>
        </div>
        <span className="hidden shrink-0 text-xs text-slate-500 sm:inline dark:text-slate-400">
          ทอง/เงิน/ทองแดง | รวม
        </span>
      </div>

      {isLoading && !data && (
        <div className="min-h-0 flex-1 space-y-2">
          {Array.from({ length: Math.min(maxRows, 10) }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 animate-pulse rounded-xl border border-slate-900/10 bg-slate-900/5 dark:border-white/10 dark:bg-white/5"
            />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:border-red-400/30 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">โหลดตารางเหรียญไม่สำเร็จ</div>
              <div className="opacity-80">{error.message}</div>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-full border border-red-500/40 px-3 py-1 text-xs hover:bg-red-500/10 dark:border-red-300/30"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (!data || data.rows.length === 0) && (
        <div className="rounded-xl border border-slate-900/10 bg-slate-900/5 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          ยังไม่มีข้อมูลเหรียญ
        </div>
      )}

      {!error && data && data.rows.length > 0 && (
        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
          {rows.map((row, idx) => (
            <li
              key={`${row.province}-${idx}`}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-xl border border-slate-900/10 px-3 py-2 text-sm dark:border-white/10"
            >
              <span className="font-mono text-slate-600 dark:text-slate-300">
                #{idx + 1}
              </span>
              <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                {row.province}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-0.5 text-amber-500">
                  <Medal size={12} />
                  {row.gold}
                </span>
                <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                  <Medal size={12} />
                  {row.silver}
                </span>
                <span className="inline-flex items-center gap-0.5 text-orange-500">
                  <Medal size={12} />
                  {row.bronze}
                </span>
                <span className="mx-0.5">|</span>
                <span className="font-semibold text-emerald-700 dark:text-slate-100">
                  {row.total}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* <div className="mt-3 flex shrink-0 items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
        <Medal size={12} />
        ข้อมูลจาก Suratgames (อัปเดตอัตโนมัติ)
      </div> */}
    </section>
  );
}
