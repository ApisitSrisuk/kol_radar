import { useEffect, useState } from 'react'
import { Modal, Field, TextInput, Select, Button } from './ui'
import { ALL_PLATFORMS, ALL_TIERS, ALL_STATUSES, PLATFORMS, TIER_LABEL, STATUS_LABEL, CATEGORIES } from '../lib/constants'
import type { Kol, KolInput, Platform } from '../types'

const empty: KolInput = {
  name: '', handle: '', category: 'ความงาม', tier: 'micro', platforms: ['ig'],
  followers: 0, engagement_rate: 0, avg_views: 0, rate_per_post: 0,
  status: 'active', roi: 0, growth: 0, contact: '',
}

export function KolForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: KolInput) => Promise<void>
  initial?: Kol | null
}) {
  const [form, setForm] = useState<KolInput>(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setErr(null)
      if (initial) {
        const { id, owner_id, created_at, ...rest } = initial
        setForm(rest)
      } else setForm(empty)
    }
  }, [open, initial])

  const set = <K extends keyof KolInput>(k: K, v: KolInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const num = (k: keyof KolInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never)

  const togglePlat = (p: Platform) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.handle.trim()) {
      setErr('กรุณากรอกชื่อและ handle')
      return
    }
    if (form.platforms.length === 0) {
      setErr('เลือกอย่างน้อย 1 แพลตฟอร์ม')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      await onSubmit(form)
      onClose()
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'แก้ไข KOL' : 'เพิ่ม KOL ใหม่'} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ชื่อ KOL">
            <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="เช่น ญาญ่า บิวตี้" />
          </Field>
          <Field label="Handle / @username">
            <TextInput value={form.handle} onChange={(e) => set('handle', e.target.value)} placeholder="@username" />
          </Field>
          <Field label="หมวดหมู่">
            <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Tier">
            <Select value={form.tier} onChange={(e) => set('tier', e.target.value as never)}>
              {ALL_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="แพลตฟอร์ม">
          <div className="flex flex-wrap gap-2">
            {ALL_PLATFORMS.map((p) => {
              const on = form.platforms.includes(p)
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePlat(p)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                    on ? 'border-transparent text-white' : 'border-line bg-surface text-muted hover:text-fg'
                  }`}
                  style={on ? { background: PLATFORMS[p].color } : undefined}
                >
                  <span className="h-4 w-4">{PLATFORMS[p].icon}</span>
                  {PLATFORMS[p].name}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Followers"><TextInput type="number" value={form.followers} onChange={num('followers')} /></Field>
          <Field label="Engagement (%)"><TextInput type="number" step="0.1" value={form.engagement_rate} onChange={num('engagement_rate')} /></Field>
          <Field label="ยอดวิวเฉลี่ย"><TextInput type="number" value={form.avg_views} onChange={num('avg_views')} /></Field>
          <Field label="ค่าตัว/โพสต์ (฿)"><TextInput type="number" value={form.rate_per_post} onChange={num('rate_per_post')} /></Field>
          <Field label="ROI (เท่า)"><TextInput type="number" step="0.1" value={form.roi} onChange={num('roi')} /></Field>
          <Field label="การเติบโต (%)"><TextInput type="number" step="0.1" value={form.growth} onChange={num('growth')} /></Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="สถานะ">
            <Select value={form.status} onChange={(e) => set('status', e.target.value as never)}>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </Select>
          </Field>
          <Field label="ช่องทางติดต่อ">
            <TextInput value={form.contact ?? ''} onChange={(e) => set('contact', e.target.value)} placeholder="อีเมล / Line / เบอร์" />
          </Field>
        </div>

        {err && <div className="rounded-lg bg-bad-soft px-3 py-2 text-[13px] text-bad">{err}</div>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
        </div>
      </form>
    </Modal>
  )
}
