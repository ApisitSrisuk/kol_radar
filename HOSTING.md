# คู่มือ Deploy & Hosting — KOL Radar

จะ host อะไร ที่ไหน อย่างไร — สรุปให้ครบในไฟล์เดียว

## 🗺️ ภาพรวม: host อะไรที่ไหน

| ส่วน | โฮสต์ที่แนะนำ | ทำหน้าที่ | ค่าใช้จ่าย |
|------|----------------|-----------|-----------|
| **Frontend** (React) | **Vercel** (หรือ Netlify / Cloudflare Pages) | หน้าเว็บทั้งหมด | ฟรี (Hobby) |
| **Database + Auth** | **Supabase** | Postgres + ล็อกอิน + RLS | ฟรี (Free tier) |
| **Backend logic** (LINE push/webhook) | **Supabase Edge Functions** | รับ/ส่งข้อความ LINE | ฟรี (รวมใน Supabase) |
| **LINE** | **LINE Developers** (Messaging API) | ช่องทางแชท | ฟรี |

> ไม่ต้องมี Node server แยก — Supabase เป็นทั้ง DB + backend (Edge Functions รันบน Deno)

```
[ผู้ใช้] → Vercel (React) → Supabase (Postgres/Auth)
                              │
                              ├── Edge Function line-push  → LINE API (เด้งเข้า LINE ของ KOL)
                              └── Edge Function line-webhook ← LINE (รับข้อความจาก KOL)
```

---

## 1) Supabase (Database + Auth + Backend)

### 1.1 สร้างโปรเจกต์
1. ไปที่ https://supabase.com → **New project** (ฟรี) → ตั้งชื่อ + รหัส DB
2. รอ ~2 นาทีจนพร้อม

### 1.2 สร้างตาราง + RLS
- เมนู **SQL Editor** → **New query** → วางไฟล์ [`backend/migrations/0001_init.sql`](backend/migrations/0001_init.sql) ทั้งหมด → **Run**
- ตรวจที่ **Table Editor**: ต้องเห็น `kols`, `campaigns`, `campaign_kols`, `messages`

### 1.3 เอา API key ไปให้ frontend
- **Project Settings → API** → คัดลอก **Project URL** และ **anon public key**

---

## 2) Frontend บน Vercel

1. push โค้ดขึ้น GitHub (ทั้งโฟลเดอร์ `kol-radar`)
2. ไปที่ https://vercel.com → **Add New → Project** → เลือก repo
3. ตั้งค่า **สำคัญ** (เพราะ repo มีทั้ง frontend + backend):
   | ช่อง | ค่า |
   |------|-----|
   | **Root Directory** | `frontend` |
   | Framework Preset | Vite (auto) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
4. **Environment Variables** ใส่:
   ```
   VITE_SUPABASE_URL = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
5. **Deploy** — เสร็จได้ URL เช่น `https://kol-radar.vercel.app`

> ไฟล์ [`frontend/vercel.json`](frontend/vercel.json) จัดการ SPA routing ให้แล้ว (refresh หน้า /kols ไม่ 404)
> repo private ก็ deploy ได้ปกติ แค่กด authorize ให้ Vercel เข้าถึง repo

---

## 3) LINE (Messaging API)

1. https://developers.line.biz → สร้าง **Provider** → **Messaging API channel**
2. คัดลอก **Channel secret** และออก **Channel access token (long-lived)**
3. เก็บไว้ใช้ตอนตั้ง secrets ด้านล่าง

---

## 4) Backend LINE (Supabase Edge Functions)

ต้องมี **Supabase CLI** ก่อน: `npm i -g supabase`

```bash
# ล็อกอิน + ผูกโปรเจกต์ (ทำที่โฟลเดอร์ backend/)
cd backend
supabase login
supabase link --project-ref <your-project-ref>

# ตั้ง secrets (คีย์ลับอยู่ฝั่ง server เท่านั้น — ไม่อยู่ใน frontend)
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxxxx
supabase secrets set LINE_CHANNEL_SECRET=xxxxx

# deploy ฟังก์ชัน
supabase functions deploy line-push
supabase functions deploy line-webhook --no-verify-jwt
```

- เอา URL webhook ไปใส่ใน **LINE Console → Messaging API → Webhook URL**:
  ```
  https://<project>.supabase.co/functions/v1/line-webhook
  ```
  แล้วเปิด **Use webhook** + ปิด **Auto-reply**

### flow ที่ได้
- **ทีมทักในระบบ** → frontend เรียก `line-push` → เด้งเข้า LINE ของ KOL (ข้อความมีป้าย `LINE`)
- **KOL ตอบใน LINE** → LINE ยิง `line-webhook` → บันทึกลง `messages` → เด้งในกล่องแชทของระบบ

> ⚠️ การ push ต้องรู้ **LINE userId** (`U...`) ของ KOL ซึ่งได้จาก webhook ตอน KOL ทัก OA ครั้งแรก
> (คอลัมน์ `line_user_id` ในตาราง `kols`) — ควรมี flow "ผูกบัญชี" เช่น ให้ KOL พิมพ์รหัสจับคู่ใน LINE
> แล้ว webhook บันทึก userId ให้แถวนั้น (มีคอมเมนต์บอกจุดแก้ไว้ใน `line-webhook/index.ts`)

---

## 5) สรุป Environment / Secrets

| ที่อยู่ | ตัวแปร | ใช้ทำอะไร |
|--------|--------|-----------|
| Vercel (frontend) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | เชื่อม Supabase |
| Supabase secrets | `LINE_CHANNEL_ACCESS_TOKEN` | ส่ง LINE push |
| Supabase secrets | `LINE_CHANNEL_SECRET` | ตรวจลายเซ็น webhook |

> `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` มีให้ใน Edge Functions อัตโนมัติ ไม่ต้องตั้งเอง

---

## ทางเลือกอื่น (ถ้าไม่ใช้ Vercel/Supabase)
- Frontend: **Netlify** / **Cloudflare Pages** (ตั้ง base = `frontend`, build `npm run build`, publish `dist`, เพิ่ม SPA redirect)
- ถ้าอยากได้ Node/Express backend แยกจริง ๆ: ต้องหา host เอง (Render / Railway / Fly.io) แล้วให้ Express ต่อ Supabase Postgres — แต่โครงปัจจุบันใช้ Supabase ตรง ไม่จำเป็น
