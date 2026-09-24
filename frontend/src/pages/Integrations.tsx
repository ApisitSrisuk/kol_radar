import { useEffect, useState } from 'react'
import { Eye, EyeOff, Copy, Check, Plug, Trash2, AlertTriangle } from 'lucide-react'
import { useToast } from '../hooks/Toast'
import { useAuth } from '../hooks/useAuth'
import { Card, CardHeader, Field, TextInput, Button } from '../components/ui'

interface LineConfig {
  channelId: string
  accessToken: string
  channelSecret: string
  connected: boolean
}
const EMPTY: LineConfig = { channelId: '', accessToken: '', channelSecret: '', connected: false }
const KEY = 'kol-line-config'

function load(): LineConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return EMPTY
}

export function Integrations() {
  const toast = useToast()
  const { isSuperAdmin } = useAuth()
  const [cfg, setCfg] = useState<LineConfig>(load)
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dirty, setDirty] = useState(false)

  const webhookUrl = `${window.location.origin}/api/line/webhook`

  useEffect(() => setDirty(false), [])

  const set = <K extends keyof LineConfig>(k: K, v: LineConfig[K]) => {
    setCfg((c) => ({ ...c, [k]: v }))
    setDirty(true)
  }

  const save = () => {
    if (!cfg.accessToken.trim() || !cfg.channelSecret.trim()) {
      toast('กรุณากรอก Channel access token และ Channel secret', 'error')
      return
    }
    const next = { ...cfg, connected: true }
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    setCfg(next)
    setDirty(false)
    toast('บันทึกการเชื่อมต่อ LINE แล้ว')
  }

  const disconnect = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setCfg(EMPTY)
    setDirty(false)
    toast('ยกเลิกการเชื่อมต่อ LINE แล้ว')
  }

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast('คัดลอกไม่สำเร็จ', 'error')
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-xl2 border border-line bg-surface p-8 text-center">
        <div className="text-[15px] font-semibold">ไม่มีสิทธิ์เข้าถึง</div>
        <p className="mt-1 text-[13px] text-muted">เฉพาะ Super Admin เท่านั้นที่ปรับการเชื่อมต่อ LINE ได้</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader
          title="เชื่อมต่อ LINE Official Account"
          hint="ใส่คีย์เพื่อเตรียมรับข้อความจาก LINE"
          action={
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
              style={{
                background: cfg.connected ? 'var(--good-soft)' : 'var(--surface-3)',
                color: cfg.connected ? 'var(--good)' : 'var(--faint)',
              }}
            >
              <i
                className="h-2 w-2 rounded-full"
                style={{ background: cfg.connected ? 'var(--good)' : 'var(--faint)' }}
              />
              {cfg.connected ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
            </span>
          }
        />

        <div className="space-y-4 p-[18px]">
          {/* Brand row */}
          <div className="flex items-center gap-3 rounded-xl2 border border-line bg-surface-2 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl2 font-display text-[13px] font-bold text-white" style={{ background: '#06C755' }}>
              LINE
            </span>
            <div className="text-[13px] text-muted">
              รับข้อความจากลูกค้า/KOL ผ่าน LINE OA เข้ามาที่ระบบ
              <div className="text-[12px] text-faint">ใช้ LINE Messaging API</div>
            </div>
          </div>

          <Field label="Channel ID (ถ้ามี)">
            <TextInput value={cfg.channelId} onChange={(e) => set('channelId', e.target.value)} placeholder="เช่น 200xxxxxxx" />
          </Field>

          <Field label="Channel access token">
            <div className="relative">
              <TextInput
                type={showToken ? 'text' : 'password'}
                value={cfg.accessToken}
                onChange={(e) => set('accessToken', e.target.value)}
                placeholder="วาง long-lived channel access token"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((s) => !s)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint hover:text-fg"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field label="Channel secret">
            <div className="relative">
              <TextInput
                type={showSecret ? 'text' : 'password'}
                value={cfg.channelSecret}
                onChange={(e) => set('channelSecret', e.target.value)}
                placeholder="วาง channel secret"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret((s) => !s)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint hover:text-fg"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Webhook URL */}
          <Field label="Webhook URL (นำไปใส่ใน LINE Developers Console)">
            <div className="flex items-center gap-2">
              <TextInput readOnly value={webhookUrl} className="flex-1 text-faint" />
              <Button variant="outline" onClick={copyWebhook}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </Button>
            </div>
          </Field>

          <div className="flex items-center gap-2 pt-1">
            <Button onClick={save} disabled={!dirty && cfg.connected}>
              <Plug size={16} />
              {cfg.connected ? 'บันทึกการตั้งค่า' : 'เชื่อมต่อ'}
            </Button>
            {cfg.connected && (
              <Button variant="ghost" onClick={disconnect}>
                <Trash2 size={15} />
                ยกเลิกการเชื่อมต่อ
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Security warning */}
      <div className="flex gap-3 rounded-xl2 border border-warn-soft bg-warn-soft p-4 text-[12.5px] text-warn">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div>
          <b>ข้อควรระวังด้านความปลอดภัย</b>
          <div className="mt-1 text-warn/90">
            โหมด Local เก็บ token/secret ไว้ในเบราว์เซอร์ (localStorage) เพื่อทดสอบเท่านั้น —
            สำหรับใช้งานจริง ต้องเก็บคีย์เหล่านี้ฝั่ง server (Supabase secrets / env) ห้ามเปิดเผยใน frontend
          </div>
        </div>
      </div>

      {/* How-to */}
      <Card>
        <CardHeader title="วิธีรับข้อความจาก LINE (ขั้นตอนถัดไป)" />
        <ol className="space-y-2.5 p-[18px] text-[13.5px] text-muted">
          {[
            'สร้าง Provider + Messaging API channel ที่ LINE Developers Console (developers.line.biz)',
            'คัดลอก Channel secret และออก Channel access token (long-lived) มาวางในหน้านี้',
            'สร้าง backend webhook (เช่น Supabase Edge Function) ที่ endpoint ด้านบน แล้วตรวจลายเซ็นด้วย Channel secret',
            'นำ Webhook URL ไปใส่ใน LINE Console → เปิด "Use webhook" และปิด auto-reply',
            'เมื่อมีข้อความเข้า webhook จะบันทึกลงตาราง messages แล้วเด้งในกล่องแชทของระบบ',
          ].map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-ink">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
