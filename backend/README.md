# KOL Radar — Backend (Supabase)

โฟลเดอร์นี้คือทุกอย่างที่ต้องเอาไปตั้งค่าบน **Supabase** (Postgres + Auth + RLS)
ไม่มี Node server แยก — Supabase ทำหน้าที่ backend ให้ (auto REST API ผ่าน `supabase-js`)

## ขั้นตอนติดตั้ง

### 1. สร้างโปรเจกต์ Supabase
1. ไปที่ https://supabase.com → **New project** (ฟรี)
2. ตั้งชื่อ + ตั้งรหัส database → รอสร้างเสร็จ ~2 นาที

### 2. สร้างตาราง + RLS
1. เมนูซ้าย → **SQL Editor** → **New query**
2. เปิดไฟล์ [`migrations/0001_init.sql`](migrations/0001_init.sql) คัดลอกทั้งหมดไปวาง → กด **Run**
3. ตรวจที่ **Table Editor** ต้องเห็นตาราง `kols`, `campaigns`, `campaign_kols`

### 3. เอา key ไปใส่ frontend
1. เมนูซ้าย → **Project Settings** → **API**
2. คัดลอก **Project URL** และ **anon public key**
3. เอาไปใส่ในไฟล์ `frontend/.env` (ดู `frontend/.env.example`)

### 4. ตั้งค่า Auth (ถ้าจะทดสอบเร็ว ๆ)
- **Authentication → Providers → Email** เปิดใช้งาน (เปิดอยู่แล้วโดย default)
- เพื่อความสะดวกตอน dev: **Authentication → Sign In / Providers → Email** ปิด
  *"Confirm email"* ไว้ก่อน จะได้ไม่ต้องยืนยันอีเมลเวลาสมัครทดสอบ

## โครงสร้างข้อมูล

| ตาราง | หน้าที่ |
|-------|---------|
| `kols` | ข้อมูล KOL แต่ละคน (followers, engagement, tier, platforms[], ค่าตัว, ROI ...) |
| `campaigns` | แคมเปญ (งบ, reach, conversions, สถานะ) |
| `campaign_kols` | ตารางเชื่อม แคมเปญ ↔ KOL (many-to-many) |

**RLS**: ทุกตารางเปิด Row Level Security — ผู้ใช้แต่ละคนเห็น/แก้ได้เฉพาะข้อมูลที่ `owner_id` เป็นของตัวเอง
(`owner_id` ตั้ง default = `auth.uid()` อัตโนมัติตอน insert)

## ข้อมูลตัวอย่าง
แนะนำให้กดปุ่ม **"โหลดข้อมูลตัวอย่าง"** ในแอปหลังล็อกอิน (ผูก owner ให้อัตโนมัติ)
หรือดู [`seed.sql`](seed.sql) หากอยาก seed ผ่าน SQL Editor เอง
