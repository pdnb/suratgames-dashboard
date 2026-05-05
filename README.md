# Surat Games 41 — Realtime Dashboard

Dashboard แบบเรียลไทม์ที่ดึงข้อมูล **ตารางการแข่งขันรายวัน** ของ "สุราษฎร์ธานีเกมส์ — กีฬาเยาวชนแห่งชาติครั้งที่ 41" จากเว็บไซต์ของการกีฬาแห่งประเทศไทย ([suratgames.sat.or.th](https://suratgames.sat.or.th/compettable2-dwt.asp?dateid=05/05/2569)) มาแสดงผลเป็นการ์ดต่อชนิดกีฬา พร้อมตัวกรองและรีเฟรชอัตโนมัติทุก 30 วินาที

## คุณสมบัติหลัก

- เลือกวันที่แบบ **พ.ศ.** ได้ (มีปุ่มเลื่อนวันก่อน/ถัดไป)
- รีเฟรชอัตโนมัติทุก 30 วินาที + ปุ่มรีเฟรชทันที + แสดงเวลาอัปเดตล่าสุด
- กรองตาม **สถานะ** (กำลังแข่ง / รอแข่ง / จบแล้ว) และ **ชนิดกีฬา**
- ค้นหาตามทีม / รายการ / สนาม
- การ์ดของแมตช์ที่ "กำลังแข่ง" จะมีขอบแดงพร้อมเอฟเฟกต์ pulse และถูกจัดให้ขึ้นบนเสมอ
- รองรับมือถือ (responsive)
- ฟอนต์ภาษาไทย (Noto Sans Thai)

## สถาปัตยกรรม

```
Browser ─┬─► /api/schedule?date=DD/MM/YYYY (Next.js Route)
         │     ├─ in-memory cache 30s (กัน hammer ต้นทาง)
         │     ├─ fetch suratgames.sat.or.th  (Buffer)
         │     ├─ iconv-lite decode windows-874 → UTF-8
         │     └─ cheerio parse → JSON {sports, matches, stats}
         └─► UI (SWR auto-refresh 30s, revalidate-on-focus)
```

จุดสำคัญ: เว็บต้นทางใช้ encoding **Windows-874 (TIS-620)** จึงต้อง decode ฝั่ง server ก่อน parse — ไม่งั้นภาษาไทยจะอ่านไม่ออก

## โครงสร้างไฟล์

```
app/
  layout.tsx                # โหลดฟอนต์ Noto Sans Thai + globals
  page.tsx                  # server component → ส่ง initialDate
  globals.css               # Tailwind v4 + theme tokens + LIVE pulse
  api/schedule/route.ts     # GET /api/schedule?date=DD/MM/YYYY
components/
  Dashboard.tsx             # main client + useSWR
  DatePickerBE.tsx          # date picker แบบ พ.ศ.
  FilterBar.tsx             # ตัวกรองสถานะ + ชนิดกีฬา + ค้นหา
  StatsHeader.tsx           # สรุปจำนวน (5 การ์ด)
  RefreshIndicator.tsx      # นาฬิกาอัปเดต + countdown + ปุ่มรีเฟรช
  SportSection.tsx          # การ์ดต่อชนิดกีฬา (collapse ได้)
  MatchRow.tsx              # การ์ดแสดงแต่ละแมตช์
  StatusBadge.tsx           # ป้ายสถานะ LIVE / FINISHED / PENDING
lib/
  types.ts                  # Match, Sport, Schedule, MatchStatus
  date.ts                   # แปลง พ.ศ. ↔ ค.ศ., format ภาษาไทย
  scraper.ts                # fetch + decode + parse HTML
```

## การติดตั้งและรัน

ต้องการ Node.js เวอร์ชัน **18.18+** หรือใหม่กว่า

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ <http://localhost:3000> — โดยค่าเริ่มต้นจะแสดงข้อมูลของวันนี้ในรูปแบบ พ.ศ.

ระบุวันที่เริ่มต้นผ่าน query string ได้:

```
http://localhost:3000/?date=05/05/2569
```

### Build / Production

```bash
npm run build
npm start
```

## API

### `GET /api/schedule?date=DD/MM/YYYY`

| พารามิเตอร์ | คำอธิบาย                                                                |
| ----------- | ----------------------------------------------------------------------- |
| `date`      | วันที่แบบ พ.ศ. รูปแบบ `DD/MM/YYYY` เช่น `05/05/2569` (ไม่ระบุ = วันนี้) |

ตัวอย่างผลลัพธ์ (ย่อ):

```json
{
  "dateBE": "05/05/2569",
  "dateAD": "2026-05-05",
  "fetchedAt": "2026-05-05T02:30:00.000Z",
  "sourceUrl": "https://suratgames.sat.or.th/compettable2-dwt.asp?dateid=05%2F05%2F2569",
  "stats": {
    "totalSports": 6,
    "totalMatches": 72,
    "liveMatches": 2,
    "finishedMatches": 2,
    "pendingMatches": 68
  },
  "sports": [
    {
      "name": "ฮอกกี้",
      "total": 9,
      "liveCount": 2,
      "finishedCount": 2,
      "pendingCount": 5,
      "matches": [
        {
          "id": "HK001",
          "sportId": "119",
          "sport": "ฮอกกี้",
          "event": "กลางแจ้ง Outdoor ทีมชาย สาย A คู่ที่ 1 นครนายก vs บุรีรัมย์",
          "round": "รอบแรก",
          "time": "08:00",
          "venue": "สนามฟุตบอล โรงเรียนพุนพินพิทยาคม",
          "venueUrl": "https://suratgames.sat.or.th/?stche_id=HK001&st_sportid=119",
          "startListUrl": "https://suratgames.sat.or.th/Startlist-dwt.asp?stdate=05/05/2569&stche_id=HK001&sthest=46",
          "resultUrl": "https://suratgames.sat.or.th/rep_hockey.asp?stche_id=HK001&st_sportid=119&f_hestid=46",
          "status": "FINISHED"
        }
      ]
    }
  ]
}
```

ตอบกลับด้วย header `Cache-Control: public, s-maxage=30, stale-while-revalidate=60` และมี in-memory cache 30 วินาทีฝั่ง server เพื่อลดภาระต้นทาง

## หมายเหตุ

- ข้อมูลทั้งหมดเป็นกรรมสิทธิ์ของการกีฬาแห่งประเทศไทย ([suratgames.sat.or.th](https://suratgames.sat.or.th/)). โปรเจกต์นี้เป็นเพียงตัวกลางในการแสดงผลเท่านั้น
- เวลาเริ่มแข่งเป็นค่าโดยประมาณ ตารางอาจมีการเปลี่ยนแปลงตามประกาศจากต้นทาง
- หากต้นทางเปลี่ยน HTML structure อาจต้องปรับ `lib/scraper.ts`

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- TypeScript 5.7
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config)
- [SWR](https://swr.vercel.app/) — auto-refresh + revalidation
- [cheerio](https://cheerio.js.org/) — HTML parsing
- [iconv-lite](https://github.com/ashtuchkin/iconv-lite) — Windows-874 decoding
- [date-fns](https://date-fns.org/), [lucide-react](https://lucide.dev/)
