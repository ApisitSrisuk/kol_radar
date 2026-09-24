import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Pencil, KeyRound } from 'lucide-react'
import { useData } from '../hooks/DataContext'
import { useToast } from '../hooks/Toast'
import { createKolLogin } from '../lib/kolAuth'
import { LOCAL_MODE } from '../lib/repo'
import { Card, CardHeader, Button, Field, TextInput } from '../components/ui'
import { Avatar, PlatformChips, TierBadge, StatusBadge, StageBadge } from '../components/common'
import { KolForm } from '../components/KolForm'
import { CompCard } from '../components/CompCard'
import { TrendChart, HBarChart } from '../components/charts'
import { PLATFORMS } from '../lib/constants'
import { fmt, baht } from '../lib/format'
import type { KolInput } from '../types'

const MONTHS = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

export function KolProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { kols, campaigns, updateKol, refreshAll } = useData()
  const toast = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const k = kols.find((x) => x.id === id)

  if (!k) {
    return (
      <div className="py-20 text-center text-faint">
        ไม่พบ KOL นี้ — <button onClick={() => nav('/kols')} className="text-accent">กลับไปรายชื่อ</button>
      </div>
    )
  }

  const kCamps = campaigns.filter((c) => c.kol_ids.includes(k.id))

  // growth series (ย้อนหลังจากค่าปัจจุบัน)
  const g = k.growth / 100
  const growth = MONTHS.map((label, i) => ({
    label,
    followers: Math.round(k.followers / Math.pow(1 + g / 6, 5 - i)),
  }))

  const engByPlat = k.platforms.map((p, i) => ({
    label: PLATFORMS[p].name,
    value: +(k.engagement_rate * (0.82 + i * 0.13)).toFixed(1),
    display: (k.engagement_rate * (0.82 + i * 0.13)).toFixed(1) + '%',
    color: PLATFORMS[p].color,
  }))

  const stats: [string, string, string?][] = [
    ['Followers รวม', fmt(k.followers)],
    ['Engagement rate', k.engagement_rate.toFixed(1) + '%', 'var(--good)'],
    ['ยอดวิวเฉลี่ย/โพสต์', fmt(k.avg_views)],
    ['ค่าตัว/โพสต์', baht(k.rate_per_post)],
    ['ROI เฉลี่ย', k.roi.toFixed(1) + 'x', 'var(--accent)'],
    ['แคมเปญที่ร่วม', String(kCamps.length)],
  ]

  const submit = async (input: KolInput) => {
    await updateKol(k.id, input)
    toast(`แก้ไข "${input.name}" แล้ว`)
  }

  const createLogin = async () => {
    if (!email.trim() || pw.length < 6) {
      toast('กรอกอีเมล และรหัสผ่านอย่างน้อย 6 ตัว', 'error')
      return
    }
    setBusy(true)
    try {
      await createKolLogin(k.id, email.trim(), pw)
      toast(`สร้างบัญชี login ให้ "${k.name}" แล้ว`)
      setLoginOpen(false)
      setEmail('')
      setPw('')
      await refreshAll()
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={() => nav('/kols')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-accent">
        <ChevronLeft size={16} />กลับไปรายชื่อ KOL
      </button>

      <Card>
        <div className="p-[18px]">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar name={k.name} seed={k.id} size={84} />
            <div className="min-w-[220px] flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-semibold">{k.name}</h2>
                <TierBadge tier={k.tier} />
                <StatusBadge status={k.status} />
              </div>
              <div className="mt-0.5 text-faint">{k.handle} · {k.category}</div>
              {(k.contact || k.line_id) && (
                <div className="mt-1 text-[12.5px] text-muted">
                  {k.contact && <>ติดต่อ: {k.contact}</>}
                  {k.contact && k.line_id && ' · '}
                  {k.line_id && <>LINE: {k.line_id}</>}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <PlatformChips platforms={k.platforms} />
                <span className="text-[12.5px] text-muted">{k.platforms.map((p) => PLATFORMS[p].name).join(' · ')}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {k.line_id && (
                <a
                  href={`https://line.me/R/ti/p/~${encodeURIComponent(k.line_id.replace(/^[@~]/, ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:brightness-105"
                  style={{ background: '#06C755' }}
                >
                  ทักผ่าน LINE
                </a>
              )}
              <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil size={15} />แก้ไข</Button>
              {!LOCAL_MODE &&
                (k.account_id ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-good-soft px-3 py-2 text-[12.5px] font-semibold text-good">
                    <KeyRound size={14} />มีบัญชี login แล้ว
                  </span>
                ) : (
                  <Button variant="outline" onClick={() => setLoginOpen(true)}>
                    <KeyRound size={15} />สร้างบัญชี login
                  </Button>
                ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
            {stats.map(([label, val, color]) => (
              <div key={label} className="rounded-[9px] bg-surface-2 p-3.5">
                <div className="text-xs text-faint">{label}</div>
                <div className="tnum mt-1 font-display text-xl font-semibold" style={color ? { color } : undefined}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="การเติบโตของผู้ติดตาม"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
                style={{ background: 'var(--surface-3)', color: k.growth >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                {k.growth >= 0 ? '+' : ''}{k.growth}%
              </span>
            }
          />
          <div className="p-[18px]">
            <TrendChart data={growth} lines={[{ key: 'followers', name: 'Followers', color: 'var(--accent)' }]} height={200} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Engagement ตามแพลตฟอร์ม" />
          <div className="p-[18px]">
            <HBarChart data={engByPlat} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Comp Card / Media Kit" />
        <div className="p-[18px]">
          <CompCard value={k.compcard} name={k.name} />
        </div>
      </Card>

      <Card>
        <CardHeader title="ประวัติแคมเปญ" hint={`${kCamps.length} แคมเปญ`} />
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-faint">
                {['แคมเปญ', 'แบรนด์', 'Reach', 'Conversions', 'สถานะ'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kCamps.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-faint">ยังไม่มีประวัติแคมเปญ</td></tr>
              ) : (
                kCamps.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3">{c.brand}</td>
                    <td className="tnum px-4 py-3">{fmt(c.reach)}</td>
                    <td className="tnum px-4 py-3">{fmt(c.conversions)}</td>
                    <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <KolForm open={editOpen} onClose={() => setEditOpen(false)} onSubmit={submit} initial={k} />

      {loginOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={() => !busy && setLoginOpen(false)}>
          <div className="w-full max-w-sm rounded-xl2 border border-line bg-surface p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold">สร้างบัญชี login ให้ {k.name}</h3>
            <p className="mt-1 text-[12.5px] text-muted">KOL จะใช้อีเมล/รหัสผ่านนี้เข้าสู่ระบบเพื่อดูโปรไฟล์และแชทกับทีม</p>
            <div className="mt-4 space-y-3">
              <Field label="อีเมล">
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kol@email.com" />
              </Field>
              <Field label="รหัสผ่าน (อย่างน้อย 6 ตัว)">
                <TextInput type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setLoginOpen(false)} disabled={busy} className="rounded-[10px] px-4 py-2 text-[13px] font-semibold text-muted hover:text-fg">ยกเลิก</button>
              <Button onClick={createLogin} disabled={busy}>{busy ? 'กำลังสร้าง...' : 'สร้างบัญชี'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
