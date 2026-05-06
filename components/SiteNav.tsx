"use client";

import Link from "next/link";

export type SiteNavPage = "daily" | "grid" | "summary";

interface Props {
  current: SiteNavPage;
}

export default function SiteNav({ current }: Props) {
  const linkCls =
    "rounded-full border border-slate-900/10 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-sky-500/40 hover:text-sky-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-sky-400/30 dark:hover:text-sky-300";
  const activeCls =
    "border-sky-500/50 bg-sky-500/10 text-sky-800 dark:border-sky-400/40 dark:text-sky-200";
  return (
    <nav className="flex flex-wrap gap-2" aria-label="เมนูหลัก">
      <Link
        href="/"
        className={`${linkCls} ${current === "daily" ? activeCls : ""}`}
      >
        ตารางรายวัน
      </Link>
      <Link
        href="/schedule"
        className={`${linkCls} ${current === "grid" ? activeCls : ""}`}
      >
        ปฏิทินกีฬา
      </Link>
      <Link
        href="/summary"
        className={`${linkCls} ${current === "summary" ? activeCls : ""}`}
      >
        สรุป
      </Link>
    </nav>
  );
}
