// ============================================================
// Supabase Edge Function: kol-register
// KOL สมัครเอง (สาธารณะ) — สร้าง auth user + โปรไฟล์ KOL + ผูกบัญชี ในสเต็ปเดียว
//
// เรียกจาก frontend (ฟอร์มสมัคร): POST /functions/v1/kol-register
//   body: { email, password, kol: {...KolInput} }
// Deploy: ปิด Verify JWT (คนสมัครยังไม่ได้ล็อกอิน)
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let body: { email?: string; password?: string; kol?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const { email, password, kol } = body
  if (!email || !password || !kol) return json({ error: 'ต้องมี email, password, kol' }, 400)
  if (password.length < 6) return json({ error: 'รหัสผ่านอย่างน้อย 6 ตัว' }, 400)
  if (!kol.name || !kol.handle) return json({ error: 'ต้องมีชื่อและ handle' }, 400)

  // หา "เจ้าของทีม" (super_admin คนแรก) ไว้เป็น owner_id ของ KOL — ให้ทีมมองเห็น
  const { data: owner } = await admin
    .from('profiles')
    .select('id')
    .eq('role', 'super_admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!owner) return json({ error: 'ระบบยังไม่มีทีมงาน (super_admin) รับสมัคร' }, 409)

  // สร้าง auth user (ยืนยันอีเมลอัตโนมัติ ไม่ต้อง confirm)
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (cErr || !created?.user) {
    return json({ error: 'สมัครไม่สำเร็จ (อีเมลนี้อาจถูกใช้แล้ว): ' + (cErr?.message ?? '') }, 400)
  }
  const uid = created.user.id

  // ตั้ง role = kol
  await admin.from('profiles').upsert({ id: uid, email, role: 'kol' })

  // สร้างแถว KOL ผูกกับบัญชี + owner ทีม
  const row = { ...kol, owner_id: owner.id, account_id: uid }
  const { error: kErr } = await admin.from('kols').insert(row)
  if (kErr) {
    // ล้าง user ที่เพิ่งสร้าง กันบัญชีค้าง
    await admin.auth.admin.deleteUser(uid).catch(() => {})
    return json({ error: 'สร้างโปรไฟล์ KOL ไม่สำเร็จ: ' + kErr.message }, 500)
  }

  return json({ ok: true })
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
