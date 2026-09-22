import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[KOL Radar] ยังไม่ได้ตั้งค่า VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — ' +
      'คัดลอก frontend/.env.example เป็น .env แล้วใส่ค่าจาก Supabase'
  )
}

export const isConfigured = Boolean(url && anonKey)

// ในโหมด Local (ยังไม่ตั้งค่า) ใช้ค่า placeholder เพื่อให้ createClient ไม่ throw
// client ตัวนี้จะไม่ถูกเรียกใช้จริง เพราะ repo ตรวจ isConfigured ก่อนเสมอ
export const supabase = createClient(
  isConfigured ? url : 'https://placeholder.supabase.co',
  isConfigured ? anonKey : 'placeholder-anon-key'
)
