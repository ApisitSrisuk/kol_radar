import { useState, type ReactNode } from 'react'
import { Plus, Megaphone, Wallet, Eye, Check, Trash2, Pencil } from 'lucide-react'
import { useData } from '../hooks/DataContext'
import { useToast } from '../hooks/Toast'
import { Card, Button } from '../components/ui'
import { Avatar } from '../components/common'
import { CampaignForm } from '../components/CampaignForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ALL_STAGES, STAGE } from '../lib/constants'
import { fmt, baht } from '../lib/format'
import type { Campaign, CampaignInput } from '../types'

function Kpi({ icon, tint, label, value }: { icon: ReactNode; tint: string; label: string; value: string }) {
  return (
    <Card className="p-[18px]">
      <div className="flex items-center justify-between text-[12.5px] text-muted">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-[9px]" style={{ background: tint }}>{icon}</span>
      </div>
      <div className="tnum mt-3 font-display text-[27px] font-semibold tracking-tight">{value}</div>
    </Card>
  )
}

export function Campaigns() {
  const { campaigns, campaignsLoading, kols, addCampaign, updateCampaign, removeCampaign } = useData()
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (c: Campaign) => { setEditing(c); setFormOpen(true) }
  const submit = async (input: CampaignInput) => {
    if (editing) {
      await updateCampaign(editing.id, input)
      toast(`แก้ไขแคมเปญ "${input.name}" แล้ว`)
    } else {
      await addCampaign(input)
      toast(`สร้างแคมเปญ "${input.name}" แล้ว`)
    }
  }
  const confirmDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await removeCampaign(confirmTarget.id)
      toast(`ลบแคมเปญ "${confirmTarget.name}" แล้ว`)
      setConfirmTarget(null)
    } catch (e) {
      toast('ลบไม่สำเร็จ: ' + (e as Error).message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const totBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totReach = campaigns.reduce((s, c) => s + c.reach, 0)
  const totConv = campaigns.reduce((s, c) => s + c.conversions, 0)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div />
        <Button onClick={openAdd}><Plus size={16} />สร้างแคมเปญ</Button>
      </div>

      <div className="mb-5 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <Kpi icon={<Megaphone size={17} />} tint="var(--accent-soft)" label="แคมเปญทั้งหมด" value={String(campaigns.length)} />
        <Kpi icon={<Wallet size={17} />} tint="rgba(224,130,26,.16)" label="งบรวม" value={baht(totBudget)} />
        <Kpi icon={<Eye size={17} />} tint="rgba(14,165,183,.15)" label="Reach รวม" value={fmt(totReach)} />
        <Kpi icon={<Check size={17} />} tint="rgba(18,164,106,.15)" label="Conversions รวม" value={fmt(totConv)} />
      </div>

      {campaignsLoading ? (
        <div className="py-16 text-center text-faint">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-flow-col gap-3.5 overflow-x-auto pb-2 [grid-auto-columns:minmax(240px,1fr)]">
          {ALL_STAGES.map((st) => {
            const list = campaigns.filter((c) => c.stage === st)
            return (
              <div key={st} className="min-w-[240px] rounded-xl2 bg-surface-2 p-3">
                <div className="flex items-center justify-between px-1.5 pb-3 text-[13.5px] font-semibold">
                  <span style={{ color: STAGE[st].color }}>{STAGE[st].label}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">{list.length}</span>
                </div>
                {list.length === 0 && (
                  <div className="py-4 text-center text-[12.5px] text-faint">ไม่มีแคมเปญ</div>
                )}
                {list.map((c) => {
                  const prog = c.budget ? Math.round((c.spent / c.budget) * 100) : 0
                  return (
                    <div key={c.id} className="group mb-2.5 rounded-[9px] border border-line bg-surface p-3 shadow-card transition hover:shadow-lift">
                      <div className="flex items-start justify-between">
                        <div className="text-[11.5px] font-semibold text-accent-ink">{c.brand || '—'}</div>
                        <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                          <button onClick={() => openEdit(c)} className="grid h-6 w-6 place-items-center rounded text-muted hover:bg-surface-3 hover:text-fg"><Pencil size={13} /></button>
                          <button onClick={() => setConfirmTarget(c)} className="grid h-6 w-6 place-items-center rounded text-muted hover:bg-bad-soft hover:text-bad"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <h4 className="mb-2 mt-1 text-[14.5px] font-semibold">{c.name}</h4>
                      <div className="flex">
                        {c.kol_ids.slice(0, 5).map((kid, i) => {
                          const kk = kols.find((x) => x.id === kid)
                          return kk ? (
                            <span key={kid} style={{ marginLeft: i ? -8 : 0 }} className="rounded-full ring-2 ring-surface">
                              <Avatar name={kk.name} seed={kk.id} size={26} />
                            </span>
                          ) : null
                        })}
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded bg-surface-3">
                        <i className="block h-full rounded" style={{ width: prog + '%', background: 'linear-gradient(90deg,var(--accent),#FF8A5B)' }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
                        <span>ใช้งบ {prog}%</span>
                        <span className="tnum">{baht(c.spent)} / {baht(c.budget)}</span>
                      </div>
                      {c.reach > 0 && (
                        <div className="mt-1 flex items-center justify-between text-[12px] text-muted">
                          <span>Reach {fmt(c.reach)}</span>
                          <span className="tnum">{fmt(c.conversions)} conv.</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <CampaignForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} initial={editing} kols={kols} />

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="ลบแคมเปญ"
        message={`ต้องการลบแคมเปญ "${confirmTarget?.name}" ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`}
      />
    </div>
  )
}
