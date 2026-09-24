// ============================================================
// Supabase Edge Function: line-push
// ส่งข้อความจากทีม → เด้งเข้า LINE ของ KOL (LINE push message)
//
// เรียกจาก frontend: POST /functions/v1/line-push  { kol_id, text }
// ต้องตั้ง secrets:
//   supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxxx
// Deploy: supabase functions deploy line-push
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

  const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (!token) return json({ error: 'ยังไม่ได้ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN' }, 500)

  let body: { kol_id?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const { kol_id, text } = body
  if (!kol_id || !text) return json({ error: 'ต้องมี kol_id และ text' }, 400)

  // ใช้ service role อ่าน line_user_id ของ KOL
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: kol, error } = await admin
    .from('kols')
    .select('line_user_id, name')
    .eq('id', kol_id)
    .single()
  if (error || !kol) return json({ error: 'ไม่พบ KOL' }, 404)
  if (!kol.line_user_id) {
    return json(
      { error: 'KOL ยังไม่เคยทัก OA จึงยังไม่มี LINE userId (ต้องให้ KOL แอด/ทัก OA ก่อน)' },
      409
    )
  }

  // ยิง LINE push
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: kol.line_user_id,
      messages: [{ type: 'text', text }],
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return json({ error: `LINE push ล้มเหลว (${res.status})`, detail }, 502)
  }

  return json({ ok: true })
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
