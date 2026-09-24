// ============================================================
// Supabase Edge Function: line-webhook
// รับ event จาก LINE → บันทึกข้อความของ KOL ลงตาราง messages
//   + เก็บ line_user_id ให้ KOL (ใช้ตอน push กลับ)
//
// ต้องตั้ง secrets:
//   supabase secrets set LINE_CHANNEL_SECRET=xxxx
// Deploy (ไม่ต้องมี JWT เพราะ LINE เรียกตรง):
//   supabase functions deploy line-webhook --no-verify-jwt
// เอา URL ไปใส่ใน LINE Console > Messaging API > Webhook URL:
//   https://<project>.supabase.co/functions/v1/line-webhook
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok')

  const bodyText = await req.text()
  let payload: { events?: unknown[] }
  try {
    payload = JSON.parse(bodyText)
  } catch {
    return new Response('ok')
  }

  // ping จากปุ่ม Verify ของ LINE (ไม่มี event) → ตอบ 200 ทันที ไม่ต้องตรวจลายเซ็น
  const events = (payload.events ?? []) as any[]
  if (events.length === 0) return new Response('ok')

  const secret = Deno.env.get('LINE_CHANNEL_SECRET')
  if (!secret) return new Response('missing secret', { status: 500 })

  // ตรวจลายเซ็น x-line-signature (HMAC-SHA256) สำหรับ event จริงเท่านั้น
  const signature = req.headers.get('x-line-signature') ?? ''
  console.log('🔑 secret length:', secret.length, '(ควรเป็น 32) | trimmed:', secret.trim().length)
  const valid = await verifySignature(secret.trim(), bodyText, signature)
  if (!valid) {
    console.error('❌ signature ไม่ตรง — LINE_CHANNEL_SECRET อาจตั้งผิด')
    return new Response('bad signature', { status: 401 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  for (const event of events) {
    if (event.type !== 'message' || event.message?.type !== 'text') continue
    const userId: string | undefined = event.source?.userId
    const text: string = (event.message.text ?? '').trim()
    const replyToken: string | undefined = event.replyToken
    if (!userId) continue
    console.log('📩 ข้อความเข้า:', JSON.stringify({ userId, text }))

    // 1) ผูกบัญชีแล้ว → บันทึกข้อความเข้าแชท
    const { data: linked } = await admin
      .from('kols')
      .select('id, owner_id')
      .eq('line_user_id', userId)
      .maybeSingle()

    if (linked) {
      await admin.from('messages').insert({
        kol_id: linked.id,
        owner_id: linked.owner_id,
        sender: 'kol',
        text,
        via_line: true,
      })
      continue
    }

    // 2) ยังไม่ผูก → ลองจับคู่ด้วย "LINE ID ที่ลงทะเบียน" (KOL พิมพ์ LINE ID ของตัวเองมา)
    const norm = text.replace(/^@/, '').toLowerCase()
    let matched: { id: string; owner_id: string; name: string } | null = null
    if (norm) {
      const { data: candidates } = await admin
        .from('kols')
        .select('id, owner_id, name, line_id')
        .is('line_user_id', null)
      matched =
        (candidates ?? []).find(
          (k: any) => (k.line_id ?? '').replace(/^@/, '').toLowerCase() === norm
        ) ?? null
    }

    if (matched) {
      console.log('✅ ผูกบัญชีสำเร็จ:', matched.name, '→', userId)
      await admin.from('kols').update({ line_user_id: userId }).eq('id', matched.id)
      await admin.from('messages').insert({
        kol_id: matched.id,
        owner_id: matched.owner_id,
        sender: 'kol',
        text: '🔗 เชื่อมบัญชี LINE สำเร็จ',
        via_line: true,
      })
      await replyLine(replyToken, `เชื่อมบัญชีกับ "${matched.name}" สำเร็จ ✅\nต่อไปคุยกับทีมงานผ่าน LINE ได้เลย`)
    } else {
      console.log('⚠️ ไม่พบ KOL ที่ line_id ตรงกับ:', norm)
      await replyLine(replyToken, 'พิมพ์ "LINE ID" ที่คุณลงทะเบียนไว้ในระบบ เพื่อเชื่อมบัญชีก่อนนะครับ')
    }
  }

  return new Response('ok')
})

// ตอบกลับผ่าน LINE reply API (ใช้ replyToken — ไม่กิน quota push)
async function replyLine(replyToken: string | undefined, text: string) {
  const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (!token || !replyToken) return
  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
    })
  } catch {
    /* ignore */
  }
}

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    const expected = btoa(String.fromCharCode(...new Uint8Array(mac)))
    return expected === signature
  } catch {
    return false
  }
}
