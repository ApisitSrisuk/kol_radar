/**
 * เชื่อมต่อ LINE — ตรวจสถานะ + ส่งข้อความ push
 * หมายเหตุ: การ push จริงต้องทำผ่าน backend (LINE API ต้องใช้ token ฝั่ง server + มี CORS)
 * โหมด Local จึง "จำลอง" การเด้งเข้า LINE เพื่อสาธิต flow
 */
import { LOCAL_MODE } from './repo'

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPA_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface LineConfig {
  channelId: string
  accessToken: string
  channelSecret: string
  connected: boolean
}

export function getLineConfig(): LineConfig | null {
  try {
    const raw = localStorage.getItem('kol-line-config')
    if (raw) {
      const c = JSON.parse(raw) as LineConfig
      if (c.connected) return c
    }
  } catch {
    /* ignore */
  }
  return null
}

export const isLineConnected = (): boolean => !!getLineConfig()

export interface PushResult {
  sent: boolean
  simulated?: boolean
  reason?: string
}

/** เด้งข้อความไปยัง LINE ของ KOL (ต้องเชื่อมต่อ LINE + KOL มี line_id) */
export async function pushMessageToLine(
  kol: { id: string; line_id?: string },
  text: string
): Promise<PushResult> {
  const cfg = getLineConfig()
  if (!cfg) return { sent: false, reason: 'ยังไม่ได้เชื่อมต่อ LINE' }
  if (!kol.line_id) return { sent: false, reason: 'KOL ยังไม่ได้แนบ LINE ID' }

  // โหมด Local: push จริงจาก browser ไม่ได้ (ต้องมี backend) — จำลอง
  if (LOCAL_MODE) {
    return { sent: true, simulated: true }
  }

  // โหมด Supabase/production: ยิงไป Edge Function line-push (ใช้ token ฝั่ง server)
  try {
    const res = await fetch(`${SUPA_URL}/functions/v1/line-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPA_ANON}`,
        apikey: SUPA_ANON,
      },
      body: JSON.stringify({ kol_id: kol.id, text }),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      return { sent: false, reason: `push ล้มเหลว (${res.status}) ${t}`.trim() }
    }
    return { sent: true }
  } catch (e) {
    return { sent: false, reason: (e as Error).message }
  }
}
