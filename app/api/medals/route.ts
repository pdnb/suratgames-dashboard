import { NextResponse } from "next/server";
import { fetchMedalTable } from "@/lib/scraper";
import type { MedalTable } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CacheEntry {
  data: MedalTable;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache: CacheEntry | null = null;
let currentCache: CacheEntry | null = cache;
let inflight: Promise<MedalTable> | null = null;

async function getMedals(): Promise<MedalTable> {
  const now = Date.now();
  if (currentCache && currentCache.expiresAt > now) return currentCache.data;
  if (inflight) return inflight;

  inflight = fetchMedalTable(10)
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
    const data = await getMedals();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
