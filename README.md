# KOL Radar

ระบบติดตาม KOL (Key Opinion Leader) หลายแพลตฟอร์ม — Dashboard, รายชื่อ KOL,
โปรไฟล์, แคมเปญ (Kanban) และหน้าวิเคราะห์ ROI พร้อมเพิ่ม/แก้/ลบข้อมูลได้จริง

**Stack:** Vite + React + TypeScript + Tailwind CSS · Supabase (Postgres + Auth + RLS) · Recharts

```
kol-radar/
├── frontend/   # React app (Vite + TS + Tailwind)
└── backend/    # Supabase schema + RLS (SQL)
```

---

## 🚀 เริ่มใช้งาน (โฟกัส Frontend ก่อน)

แอปมี **2 โหมด** สลับอัตโนมัติตามว่าได้ตั้งค่า Supabase หรือยัง:

| โหมด | เงื่อนไข | ข้อมูลเก็บที่ | ล็อกอิน |
|------|----------|--------------|---------|
| 🧪 **Local** | ยังไม่ตั้งค่า `.env` | `localStorage` ในเบราว์เซอร์ | ข้าม (เข้าใช้ได้เลย) |
| ☁️ **Supabase** | ใส่ค่าใน `.env` แล้ว | ฐานข้อมูล Supabase | ต้องล็อกอิน |

### รันแบบ Local (เห็นผลทันที ไม่ต้องตั้ง Supabase)

```bash
cd frontend
npm install
npm run dev
```

เปิด http://localhost:5173 → กด **"โหลดข้อมูลตัวอย่าง"** ในหน้าภาพรวม
จะได้ KOL 12 คน + แคมเปญ 6 อัน ให้ลองเล่นทันที

> ข้อมูลโหมด Local เก็บในเบราว์เซอร์เครื่องนี้เท่านั้น (ล้างได้จาก DevTools > Application > Local Storage)

---

## ☁️ ต่อ Supabase (ทำภายหลัง เมื่อพร้อม)

1. สร้างโปรเจกต์ที่ https://supabase.com
2. รัน SQL ใน [`backend/migrations/0001_init.sql`](backend/migrations/0001_init.sql) ที่ SQL Editor
3. คัดลอก `frontend/.env.example` → `frontend/.env` แล้วใส่ Project URL + anon key
4. `npm run dev` อีกครั้ง — แอปจะสลับเป็นโหมด Supabase อัตโนมัติ (มีหน้า login)

รายละเอียดดูที่ [`backend/README.md`](backend/README.md)

---

## ✨ ฟีเจอร์

- **Dashboard** — KPI สรุป, กราฟแนวโน้ม Engagement/ROI, สัดส่วนแพลตฟอร์ม, KOL ผลงานดีสุด
- **รายชื่อ KOL** — ตาราง + กรอง (tier / แพลตฟอร์ม / หมวดหมู่) + ค้นหา + เพิ่ม/แก้/ลบ
- **โปรไฟล์ KOL** — metrics, กราฟการเติบโต, engagement รายแพลตฟอร์ม, ประวัติแคมเปญ
- **แคมเปญ** — บอร์ด Kanban (วางแผน/ทำงาน/ตรวจสอบ/เสร็จ) + ผูก KOL เข้าแคมเปญ
- **วิเคราะห์** — ROI รายบุคคล, หมวดหมู่, engagement ตามแพลตฟอร์ม, bubble chart
- รองรับ TikTok / Instagram / YouTube / Facebook / X · ธีมสว่าง-มืด · responsive

## 📜 สคริปต์ (ใน `frontend/`)

| คำสั่ง | ผล |
|--------|-----|
| `npm run dev` | รัน dev server |
| `npm run build` | typecheck + build เป็น production |
| `npm run preview` | ดูตัว build |
