import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useData } from '../../hooks/DataContext'
import { useToast } from '../../hooks/Toast'
import { Card, CardHeader, Button, Modal, Field, TextInput, Select } from '../../components/ui'
import { ImageField } from '../../components/ImageField'
import { CompCard } from '../../components/CompCard'
import { Avatar, PlatformChips, TierBadge, StatusBadge } from '../../components/common'
import { PLATFORMS, ALL_PLATFORMS, TIER_LABEL, CATEGORIES, tierFromFollowers } from '../../lib/constants'
import { fmt, baht } from '../../lib/format'
import type { KolInput, Platform, Kol } from '../../types'

export function PortalProfile() {
  const { kolId } = useOutletContext<{ kolId: string }>()
  const { kols, updateKol } = useData()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const me = kols.find((k) => k.id === kolId)
  if (!me) return <div className="py-16 text-center text-faint">ไม่พบข้อมูล</div>

  const rows: [string, string, string?][] = [
    ['หมวดหมู่', me.category],
    ['Followers', fmt(me.followers)],
    ['Engagement rate', me.engagement_rate.toFixed(1) + '%', 'var(--good)'],
    ['ยอดวิวเฉลี่ย/โพสต์', fmt(me.avg_views)],
    ['ค่าตัว/โพสต์', baht(me.rate_per_post)],
    ['ROI (ทีมประเมิน)', me.roi.toFixed(1) + 'x', 'var(--accent)'],
    ['ช่องทางติดต่อ', me.contact || '—'],
  ]

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-[18px]">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar name={me.name} seed={me.id} size={84} />
            <div className="min-w-[220px] flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-semibold">{me.name}</h2>
                <TierBadge tier={me.tier} />
                <StatusBadge status={me.status} />
              </div>
              <div className="mt-0.5 text-faint">{me.handle}</div>
              <div className="mt-3 flex items-center gap-2">
                <PlatformChips platforms={me.platforms} />
                <span className="text-[12.5px] text-muted">{me.platforms.map((p) => PLATFORMS[p].name).join(' · ')}</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setOpen(true)}><Pencil size={15} />แก้ไขข้อมูล</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="ข้อมูลของฉัน" />
          <div className="divide-y divide-line">
            {rows.map(([label, val, color]) => (
              <div key={label} className="flex items-center justify-between px-[18px] py-3">
                <span className="text-[13px] text-muted">{label}</span>
                <span className="tnum font-semibold" style={color ? { color } : undefined}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Comp Card / Media Kit" hint="อัปโหลด/เปลี่ยนได้ที่ปุ่มแก้ไขข้อมูล" />
          <div className="p-[18px]">
            <CompCard value={me.compcard} name={me.name} emptyText="ยังไม่มี comp card — กด “แก้ไขข้อมูล” เพื่ออัปโหลด" />
          </div>
        </Card>
      </div>

      <EditModal
        open={open}
        me={me}
        onClose={() => setOpen(false)}
        onSave={async (input) => {
          await updateKol(me.id, input)
          toast('บันทึกโปรไฟล์แล้ว')
        }}
      />
    </div>
  )
}

interface EditState {
  name: string
  handle: string
  category: string
  platforms: Platform[]
  followers: number
  engagement_rate: number
  rate_per_post: number
  contact: string
  compcard?: string
}

function EditModal({
  open,
  me,
  onClose,
  onSave,
}: {
  open: boolean
  me: Kol
  onClose: () => void
  onSave: (input: KolInput) => Promise<void>
}) {
  const [form, setForm] = useState<EditState>(pick(me))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setForm(pick(me)); setErr(null) }
  }, [open, me])

  const set = <K extends keyof EditState>(k: K, v: EditState[K]) => setForm((f) => ({ ...f, [k]: v }))
  const num = (k: keyof EditState) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never)
  const togglePlat = (p: Platform) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.handle.trim()) { setErr('กรุณากรอกชื่อและ handle'); return }
    if (form.platforms.length === 0) { setErr('เลือกอย่างน้อย 1 แพลตฟอร์ม'); return }
    setBusy(true)
    setErr(null)
    try {
      // เก็บค่าที่ทีมเป็นผู้ดูแล (status, roi, growth, avg_views) ไว้เหมือนเดิม
      const input: KolInput = {
        name: form.name.trim(),
        handle: form.handle.trim(),
        category: form.category,
        tier: tierFromFollowers(form.followers),
        platforms: form.platforms,
        followers: form.followers,
        engagement_rate: form.engagement_rate,
        avg_views: me.avg_views,
        rate_per_post: form.rate_per_post,
        status: me.status,
        roi: me.roi,
        growth: me.growth,
        contact: form.contact.trim(),
        compcard: form.compcard,
      }
      await onSave(input)
      onClose()
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="แก้ไขข้อมูลของฉัน" wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ชื่อ / ชื่อในวงการ">
            <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Handle / @username">
            <TextInput value={form.handle} onChange={(e) => set('handle', e.target.value)} />
          </Field>
          <Field label="หมวดหมู่คอนเทนต์">
            <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="ช่องทางติดต่อ">
            <TextInput value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="อีเมล / Line / เบอร์" />
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Followers"><TextInput type="number" value={form.followers} onChange={num('followers')} /></Field>
          <Field label="Engagement (%)"><TextInput type="number" step="0.1" value={form.engagement_rate} onChange={num('engagement_rate')} /></Field>
          <Field label="ค่าตัว/โพสต์ (฿)"><TextInput type="number" value={form.rate_per_post} onChange={num('rate_per_post')} /></Field>
        </div>

        <Field label="Comp card / Media kit">
          <ImageField value={form.compcard} onChange={(v) => set('compcard', v)} />
        </Field>

        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] text-muted">
          ระดับที่ประเมินอัตโนมัติ:
          <span className="font-semibold text-fg">{TIER_LABEL[tierFromFollowers(form.followers)]}</span>
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

function pick(k: Kol): EditState {
  return {
    name: k.name,
    handle: k.handle,
    category: k.category,
    platforms: k.platforms,
    followers: k.followers,
    engagement_rate: k.engagement_rate,
    rate_per_post: k.rate_per_post,
    contact: k.contact ?? '',
    compcard: k.compcard,
  }
}
