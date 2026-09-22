import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Modal, Field, TextInput, Select, Button } from './ui'
import { ALL_PLATFORMS, PLATFORMS, TIER_LABEL, CATEGORIES, tierFromFollowers } from '../lib/constants'
import * as repo from '../lib/repo'
import { fmt } from '../lib/format'
import type { KolInput, Platform } from '../types'

interface ApplyState {
  name: string
  handle: string
  category: string
  platforms: Platform[]
  followers: number
  engagement_rate: number
  rate_per_post: number
  contact: string
}

const empty: ApplyState = {
  name: '', handle: '', category: 'ความงาม', platforms: ['ig'],
  followers: 0, engagement_rate: 0, rate_per_post: 0, contact: '',
}

export function KolApplyForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<ApplyState>(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) { setForm(empty); setErr(null); setDone(false) }
  }, [open])

  const set = <K extends keyof ApplyState>(k: K, v: ApplyState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))
  const num = (k: keyof ApplyState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never)
  const togglePlat = (p: Platform) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }))

  const tier = tierFromFollowers(form.followers)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.handle.trim()) { setErr('กรุณากรอกชื่อและ handle'); return }
    if (form.platforms.length === 0) { setErr('เลือกอย่างน้อย 1 แพลตฟอร์ม'); return }
    if (!form.contact.trim()) { setErr('กรุณากรอกช่องทางติดต่อ'); return }
    setBusy(true)
    setErr(null)
    try {
      const input: KolInput = {
        name: form.name.trim(),
        handle: form.handle.trim(),
        category: form.category,
        tier,
        platforms: form.platforms,
        followers: form.followers,
        engagement_rate: form.engagement_rate,
        avg_views: 0,
        rate_per_post: form.rate_per_post,
        status: 'pending',
        roi: 0,
        growth: 0,
        contact: form.contact.trim(),
      }
      await repo.addKol(input)
      setDone(true)
    } catch (e2) {
      setErr(
        (e2 as Error).message +
          ' (ในโหมด Supabase การสมัครสาธารณะต้องตั้งค่าตารางรับสมัครเพิ่มเติม)'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="สมัครเป็น KOL" wide>
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-good-soft text-good">
            <CheckCircle2 size={34} />
          </div>
          <h3 className="mb-1 text-xl font-semibold">ส่งใบสมัครเรียบร้อย!</h3>
          <p className="mb-5 text-sm text-muted">
            ทีมงานได้รับข้อมูลของคุณแล้ว (สถานะ “รออนุมัติ”) และจะติดต่อกลับทางช่องทางที่ให้ไว้
          </p>
          <Button onClick={onClose}>เสร็จสิ้น</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-[12.5px] text-accent-ink">
            กรอกข้อมูลเพื่อเข้าร่วมเครือข่าย KOL ของเรา — ทีมงานจะรีวิวและติดต่อกลับ
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ชื่อ / ชื่อในวงการ">
              <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="เช่น น้องเอ บิวตี้" />
            </Field>
            <Field label="Handle / @username">
              <TextInput value={form.handle} onChange={(e) => set('handle', e.target.value)} placeholder="@username" />
            </Field>
            <Field label="หมวดหมู่คอนเทนต์">
              <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="ช่องทางติดต่อ (อีเมล / Line / เบอร์)">
              <TextInput value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="you@email.com หรือ Line ID" />
            </Field>
          </div>

          <Field label="แพลตฟอร์มที่ใช้งาน">
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
            <Field label="Followers รวม">
              <TextInput type="number" value={form.followers} onChange={num('followers')} />
            </Field>
            <Field label="Engagement (%)">
              <TextInput type="number" step="0.1" value={form.engagement_rate} onChange={num('engagement_rate')} />
            </Field>
            <Field label="ค่าตัว/โพสต์ (฿)">
              <TextInput type="number" value={form.rate_per_post} onChange={num('rate_per_post')} />
            </Field>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] text-muted">
            ระดับที่ประเมินอัตโนมัติ:
            <span className="font-semibold text-fg">{TIER_LABEL[tier]}</span>
            <span className="text-faint">({fmt(form.followers)} followers)</span>
          </div>

          {err && <div className="rounded-lg bg-bad-soft px-3 py-2 text-[13px] text-bad">{err}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" disabled={busy}>{busy ? 'กำลังส่ง...' : 'ส่งใบสมัคร'}</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
