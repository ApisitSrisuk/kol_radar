import { useEffect, useState } from 'react'
import { Modal, Field, TextInput, Select, Button } from './ui'
import { Avatar } from './common'
import { ALL_STAGES, STAGE } from '../lib/constants'
import type { Campaign, CampaignInput, Kol } from '../types'

const empty: CampaignInput = {
  name: '', brand: '', stage: 'planning', budget: 0, spent: 0,
  reach: 0, conversions: 0, start_date: null, end_date: null, kol_ids: [],
}

export function CampaignForm({
  open,
  onClose,
  onSubmit,
  initial,
  kols,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: CampaignInput) => Promise<void>
  initial?: Campaign | null
  kols: Kol[]
}) {
  const [form, setForm] = useState<CampaignInput>(empty)
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

  const set = <K extends keyof CampaignInput>(k: K, v: CampaignInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))
  const num = (k: keyof CampaignInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never)

  const toggleKol = (id: string) =>
    setForm((f) => ({
      ...f,
      kol_ids: f.kol_ids.includes(id)
        ? f.kol_ids.filter((x) => x !== id)
        : [...f.kol_ids, id],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setErr('กรุณากรอกชื่อแคมเปญ')
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
    <Modal open={open} onClose={onClose} title={initial ? 'แก้ไขแคมเปญ' : 'สร้างแคมเปญใหม่'} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ชื่อแคมเปญ">
            <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="เช่น เปิดตัวสินค้าใหม่" />
          </Field>
          <Field label="แบรนด์">
            <TextInput value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="ชื่อแบรนด์" />
          </Field>
          <Field label="สถานะ">
            <Select value={form.stage} onChange={(e) => set('stage', e.target.value as never)}>
              {ALL_STAGES.map((s) => <option key={s} value={s}>{STAGE[s].label}</option>)}
            </Select>
          </Field>
          <Field label="งบประมาณ (฿)">
            <TextInput type="number" value={form.budget} onChange={num('budget')} />
          </Field>
          <Field label="ใช้ไปแล้ว (฿)">
            <TextInput type="number" value={form.spent} onChange={num('spent')} />
          </Field>
          <Field label="Reach">
            <TextInput type="number" value={form.reach} onChange={num('reach')} />
          </Field>
          <Field label="Conversions">
            <TextInput type="number" value={form.conversions} onChange={num('conversions')} />
          </Field>
          <Field label="วันเริ่ม">
            <TextInput type="date" value={form.start_date ?? ''} onChange={(e) => set('start_date', e.target.value || null)} />
          </Field>
        </div>

        <Field label={`เลือก KOL (${form.kol_ids.length} คน)`}>
          <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-[10px] border border-line bg-bg p-2">
            {kols.length === 0 && (
              <div className="px-2 py-4 text-center text-[13px] text-faint">
                ยังไม่มี KOL — เพิ่ม KOL ก่อนในหน้ารายชื่อ
              </div>
            )}
            {kols.map((k) => {
              const on = form.kol_ids.includes(k.id)
              return (
                <button
                  type="button"
                  key={k.id}
                  onClick={() => toggleKol(k.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition ${
                    on ? 'border-accent bg-accent-soft' : 'border-transparent hover:bg-surface-2'
                  }`}
                >
                  <Avatar name={k.name} seed={k.id} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">{k.name}</div>
                    <div className="truncate text-[11.5px] text-faint">{k.handle}</div>
                  </div>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-md border text-white ${
                      on ? 'border-accent bg-accent' : 'border-line-strong'
                    }`}
                  >
                    {on ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </Field>

        {err && <div className="rounded-lg bg-bad-soft px-3 py-2 text-[13px] text-bad">{err}</div>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
        </div>
      </form>
    </Modal>
  )
}
