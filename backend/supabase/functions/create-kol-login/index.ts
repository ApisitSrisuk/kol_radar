// ============================================================
// Supabase Edge Function: create-kol-login
// ทีม (super_admin/admin) สร้างบัญชี login (email/password) ให้ KOL
//   → สร้าง auth user + ตั้ง role='kol' + ผูก kols.account_id
//
// เรียกจาก frontend: POST /functions/v1/create-kol-login
//   headers: Authorization: Bearer <session access_token ของทีม>
//   body: { kol_id, email, password }
// Deploy: ปิด Verify JWT (ตรวจสิทธิ์เองในโค้ด)
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

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

  // 1) ตรวจสิทธิ์ผู้เรียก — ต้องเป็นทีม (super_admin/admin)
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  if (!token) return json({ error: 'ต้องล็อกอินก่อน' }, 401)
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return json({ error: 'token ไม่ถูกต้อง' }, 401)
  const { data: prof } = await admin
    .from('profiles')
    .select('role')
    .eq('id', caller.user.id)
    .maybeSingle()
  if (!prof || (prof.role !== 'super_admin' && prof.role !== 'admin')) {
    return json({ error: 'ไม่มีสิทธิ์ (เฉพาะทีมงาน)' }, 403)
  }

  // 2) อ่าน input
  let body: { kol_id?: string; email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const { kol_id, email, password } = body
  if (!kol_id || !email || !password) return json({ error: 'ต้องมี kol_id, email, password' }, 400)
  if (password.length < 6) return json({ error: 'รหัสผ่านอย่างน้อย 6 ตัว' }, 400)

  // 3) ตรวจว่า KOL มีอยู่จริง + ยังไม่ผูกบัญชี
  const { data: kol } = await admin.from('kols').select('id, account_id, name').eq('id', kol_id).single()
  if (!kol) return json({ error: 'ไม่พบ KOL' }, 404)
  if (kol.account_id) return json({ error: 'KOL นี้มีบัญชี login แล้ว' }, 409)

  // 4) สร้าง auth user (ยืนยันอีเมลให้เลย)
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (cErr || !created?.user) return json({ error: 'สร้างบัญชีไม่สำเร็จ: ' + (cErr?.message ?? '') }, 400)
  const newUid = created.user.id

  // 5) ตั้ง role='kol' + ผูก account_id
  await admin.from('profiles').upsert({ id: newUid, email, role: 'kol' })
  const { error: linkErr } = await admin.from('kols').update({ account_id: newUid }).eq('id', kol_id)
  if (linkErr) return json({ error: 'ผูกบัญชีไม่สำเร็จ: ' + linkErr.message }, 500)

  return json({ ok: true, email, kol: kol.name })
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
