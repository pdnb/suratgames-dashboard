import { NextResponse } from "next/server";
import { fetchScheduleGrid } from "@/lib/scraper";
import type { ScheduleGrid } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CacheEntry {
  data: ScheduleGrid;
  expiresAt: number;
}

const CACHE_TTL_MS = 300_000;
let currentCache: CacheEntry | null = null;
let inflight: Promise<ScheduleGrid> | null = null;

async function getScheduleGrid(): Promise<ScheduleGrid> {
  const now = Date.now();
  if (currentCache && currentCache.expiresAt > now) return currentCache.data;
  if (inflight) return inflight;

  inflight = fetchScheduleGrid()
    .then((data) => {
      currentCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export async function GET() {
  try {
    const data = await getScheduleGrid();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ";
    return NextResponse.json(
      {
        error: "ไม่สามารถดึงข้อมูลจากต้นทางได้",
        detail: message,
      },
      { status: 502 }
    );
  }
}
