"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  fetchedAt: string | null;
  refreshIntervalMs: number;
  isValidating: boolean;
  onRefresh: () => void;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function RefreshIndicator({
  fetchedAt,
  refreshIntervalMs,
  isValidating,
  onRefresh,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchedMs = fetchedAt ? new Date(fetchedAt).getTime() : null;
  const elapsed = fetchedMs ? Math.max(0, now - fetchedMs) : 0;
  const remaining = fetchedMs
    ? Math.max(0, Math.ceil((refreshIntervalMs - elapsed) / 1000))
    : Math.ceil(refreshIntervalMs / 1000);

  const fetchedLabel = fetchedMs ? formatTime(new Date(fetchedMs)) : "—";

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      <span className="hidden items-center gap-1.5 sm:inline-flex">
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isValidating
                ? "animate-ping bg-sky-500 dark:bg-sky-400"
                : "bg-emerald-500 dark:bg-emerald-400"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isValidating
                ? "bg-sky-500 dark:bg-sky-400"
                : "bg-emerald-500 dark:bg-emerald-400"
            }`}
          />
        </span>
        <span>อัปเดตล่าสุด</span>
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {fetchedLabel}
        </span>
      </span>
      <span className="hidden text-slate-400 dark:text-slate-500 sm:inline">
        •
      </span>
      <span className="hidden sm:inline">
        รีเฟรชอีกใน{" "}
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {remaining}s
        </span>
      </span>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-1 rounded-full border border-slate-900/10 bg-slate-900/5 px-2 py-1 text-xs hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-sky-400/40 dark:hover:text-sky-300"
        disabled={isValidating}
        title="รีเฟรชทันที"
      >
        <RefreshCw size={12} className={isValidating ? "animate-spin" : ""} />
        รีเฟรช
      </button>
    </div>
  );
}
