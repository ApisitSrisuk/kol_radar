import { useState } from 'react'
import { Sparkles, ArrowRight, Users, UserCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme, DEFAULT_SITE_NAME } from '../hooks/ThemeContext'
import { isConfigured } from '../lib/supabase'
import * as repo from '../lib/repo'
import { KolApplyForm } from '../components/KolApplyForm'
import { LogoBadge } from '../components/LogoBadge'

export function Login({
  localMode = false,
  onEnterTeam,
  onEnterKol,
}: {
  localMode?: boolean
  onEnterTeam?: () => void
  onEnterKol?: (kolId: string) => void
}) {
  const { signIn, signUp } = useAuth()
  const { siteName } = useTheme()
  const brand = siteName.trim() || DEFAULT_SITE_NAME
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [applyOpen, setApplyOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // KOL portal login (โหมด Local)
  const [kolInput, setKolInput] = useState('')
  const [kolErr, setKolErr] = useState<string | null>(null)
  const [kolBusy, setKolBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      if (mode === 'in') await signIn(email, password)
      else {
        await signUp(email, password)
        setMsg('สมัครสำเร็จ! ถ้าเปิด confirm email ไว้ กรุณายืนยันในอีเมล แล้วกลับมาล็อกอิน')
      }
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const kolLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setKolBusy(true)
    setKolErr(null)
    try {
      const list = await repo.fetchKols()
      const raw = kolInput.trim().toLowerCase()
      const q = raw.replace(/^@/, '')
      const found = list.find(
        (k) =>
          k.handle.toLowerCase().replace(/^@/, '') === q ||
          (k.contact ?? '').toLowerCase() === raw ||
          k.name.toLowerCase() === raw
      )
      if (found) onEnterKol?.(found.id)
      else setKolErr('ไม่พบข้อมูล KOL นี้ — ลองกด "สมัครเป็น KOL" ก่อนได้เลย')
    } catch (e2) {
      setKolErr((e2 as Error).message)
    } finally {
      setKolBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LogoBadge size={56} radius={18} />
          <div>
            <h1 className="font-display text-2xl font-semibold">{brand}</h1>
            <p className="text-[13px] text-faint">ระบบติดตาม KOL ทุกแพลตฟอร์ม</p>
          </div>
        </div>

        {localMode ? (
          <>
            {/* ทีมการตลาด */}
            <div className="rounded-xl2 border border-line bg-surface p-5 shadow-card">
              <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold">
                <Users size={16} className="text-accent" /> สำหรับทีมการตลาด
              </div>
              <p className="mb-3 text-[12.5px] text-muted">จัดการ KOL, แคมเปญ และดูภาพรวมทั้งหมด</p>
              <button
                onClick={onEnterTeam}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
              >
                เข้าใช้งานระบบ <ArrowRight size={16} />
              </button>
            </div>

            {/* KOL Portal */}
            <form onSubmit={kolLogin} className="mt-4 rounded-xl2 border border-line bg-surface p-5 shadow-card">
              <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold">
                <UserCircle size={16} className="text-accent" /> สำหรับ KOL
              </div>
              <p className="mb-3 text-[12.5px] text-muted">เข้าสู่พื้นที่ของคุณ — ดูสถิติและแคมเปญที่ได้รับ</p>
              <input
                value={kolInput}
                onChange={(e) => setKolInput(e.target.value)}
                placeholder="handle หรืออีเมลที่ใช้สมัคร เช่น @yaya.beauty"
                className="w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              {kolErr && <div className="mt-2 rounded-lg bg-bad-soft px-3 py-2 text-[12.5px] text-bad">{kolErr}</div>}
              <button
                type="submit"
                disabled={kolBusy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-accent py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-soft disabled:opacity-50"
              >
                {kolBusy ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ KOL'}
              </button>
              <div className="mt-3 border-t border-line pt-3 text-center text-[12.5px] text-muted">
                ยังไม่มีบัญชี KOL?{' '}
                <button type="button" onClick={() => setApplyOpen(true)} className="font-semibold text-accent">
                  สมัครเป็น KOL
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {!isConfigured && (
              <div className="mb-4 rounded-xl2 border border-warn-soft bg-warn-soft px-4 py-3 text-[12.5px] text-warn">
                ⚠️ ยังไม่ได้ตั้งค่า Supabase — คัดลอก <code>frontend/.env.example</code> เป็น{' '}
                <code>.env</code> แล้วใส่ค่าจาก Supabase ก่อนใช้งาน
              </div>
            )}
            <form onSubmit={submit} className="space-y-4 rounded-xl2 border border-line bg-surface p-6 shadow-card">
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
          </>
        )}
      </div>

      <KolApplyForm open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  )
}
