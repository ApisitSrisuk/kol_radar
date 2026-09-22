import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { isConfigured } from '../lib/supabase'
import { KolApplyForm } from '../components/KolApplyForm'

export function Login({
  localMode = false,
  onLocalEnter,
}: {
  localMode?: boolean
  onLocalEnter?: () => void
}) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [applyOpen, setApplyOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      if (mode === 'in') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setMsg('สมัครสำเร็จ! ถ้าเปิด confirm email ไว้ กรุณายืนยันในอีเมล แล้วกลับมาล็อกอิน')
      }
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl font-display text-3xl font-bold text-white shadow-card"
            style={{ background: 'linear-gradient(135deg,var(--accent),#FF8A5B)' }}
          >
            K
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">KOL Radar</h1>
            <p className="text-[13px] text-faint">ระบบติดตาม KOL ทุกแพลตฟอร์ม</p>
          </div>
        </div>

        {localMode ? (
          <div className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
            <div className="mb-4 rounded-lg bg-warn-soft px-3 py-2 text-center text-[12px] text-warn">
              🧪 โหมด Local — ยังไม่ได้ตั้งค่า Supabase
            </div>
            <p className="mb-3 text-center text-[13px] text-muted">
              เข้าใช้งานระบบจัดการ (สำหรับทีมการตลาด)
            </p>
            <button
              onClick={onLocalEnter}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              เข้าใช้งานระบบ <ArrowRight size={16} />
            </button>
            <p className="mt-2 text-center text-[11.5px] text-faint">โหมดทดลอง ไม่ต้องล็อกอิน</p>
          </div>
        ) : (
          <>
            {!isConfigured && (
              <div className="mb-4 rounded-xl2 border border-warn-soft bg-warn-soft px-4 py-3 text-[12.5px] text-warn">
                ⚠️ ยังไม่ได้ตั้งค่า Supabase — คัดลอก <code>frontend/.env.example</code> เป็น{' '}
                <code>.env</code> แล้วใส่ค่าจาก Supabase ก่อนใช้งาน
              </div>
            )}
            <form
              onSubmit={submit}
              className="space-y-4 rounded-xl2 border border-line bg-surface p-6 shadow-card"
            >
              <div className="flex rounded-[10px] bg-surface-2 p-1">
                {(['in', 'up'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold transition ${
                      mode === m ? 'bg-surface text-fg shadow-card' : 'text-muted'
                    }`}
                  >
                    {m === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="mb-1 block text-[12.5px] font-medium text-muted">อีเมล</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12.5px] font-medium text-muted">รหัสผ่าน</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
              </label>

              {err && <div className="rounded-lg bg-bad-soft px-3 py-2 text-[13px] text-bad">{err}</div>}
              {msg && <div className="rounded-lg bg-good-soft px-3 py-2 text-[13px] text-good">{msg}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-[10px] bg-accent py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
              >
                {busy ? 'กำลังดำเนินการ...' : mode === 'in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            </form>
          </>
        )}

        {/* สำหรับ KOL ที่อยากสมัครเข้าร่วม */}
        <div className="mt-4 rounded-xl2 border border-line bg-surface p-4 text-center">
          <p className="text-[13px] text-muted">เป็น KOL / อินฟลูเอนเซอร์?</p>
          <button
            onClick={() => setApplyOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-[10px] border border-accent px-4 py-2 text-[13px] font-semibold text-accent transition hover:bg-accent-soft"
          >
            <Sparkles size={15} />
            สมัครเป็น KOL
          </button>
        </div>
      </div>

      <KolApplyForm open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  )
}
