import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useData } from '../hooks/DataContext'
import { useToast } from '../hooks/Toast'
import { useAuth } from '../hooks/useAuth'
import { Card, Button } from '../components/ui'
import { Avatar, PlatformChips, TierBadge, StatusBadge, Engagement } from '../components/common'
import { KolForm } from '../components/KolForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ALL_TIERS, ALL_PLATFORMS, TIER_LABEL, PLATFORMS, CATEGORIES } from '../lib/constants'
import { fmt, baht } from '../lib/format'
import type { Kol, Tier, Platform, KolInput } from '../types'

export function Kols() {
  const { kols, loading, addKol, updateKol, removeKol } = useData()
  const toast = useToast()
  const { isSuperAdmin } = useAuth()
  const nav = useNavigate()
  const [tier, setTier] = useState<Tier | 'all'>('all')
  const [plat, setPlat] = useState<Platform | 'all'>('all')
  const [cat, setCat] = useState<string>('all')
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Kol | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Kol | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return kols.filter(
      (k) =>
        (tier === 'all' || k.tier === tier) &&
        (plat === 'all' || k.platforms.includes(plat)) &&
        (cat === 'all' || k.category === cat) &&
        (!query || k.name.toLowerCase().includes(query) || k.handle.toLowerCase().includes(query))
    )
  }, [kols, tier, plat, cat, q])

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (k: Kol) => { setEditing(k); setFormOpen(true) }
  const submit = async (input: KolInput) => {
    if (editing) {
      await updateKol(editing.id, input)
      toast(`แก้ไข "${input.name}" แล้ว`)
    } else {
      await addKol(input)
      toast(`เพิ่ม "${input.name}" แล้ว`)
    }
  }
  const confirmDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await removeKol(confirmTarget.id)
      toast(`ลบ "${confirmTarget.name}" แล้ว`)
      setConfirmTarget(null)
    } catch (e) {
      toast('ลบไม่สำเร็จ: ' + (e as Error).message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ / handle..."
            className="w-52 rounded-[10px] border border-line bg-surface py-2 pl-9 pr-3 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <select value={plat} onChange={(e) => setPlat(e.target.value as Platform | 'all')} className="rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px]">
          <option value="all">ทุกแพลตฟอร์ม</option>
          {ALL_PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORMS[p].name}</option>)}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-[10px] border border-line bg-surface px-3 py-2 text-[13px]">
          <option value="all">ทุกหมวดหมู่</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Button onClick={openAdd} className="ml-auto"><Plus size={16} />เพิ่ม KOL</Button>
      </div>

      <div className="mb-4 flex rounded-[10px] bg-surface-2 p-1 w-fit max-w-full overflow-x-auto">
        {(['all', ...ALL_TIERS] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
              tier === t ? 'bg-surface text-fg shadow-card font-semibold' : 'text-muted'
            }`}
          >
            {t === 'all' ? 'ทั้งหมด' : TIER_LABEL[t]}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wide text-faint">
                {['KOL', 'หมวดหมู่', 'Tier', 'แพลตฟอร์ม', 'Followers', 'Engagement', 'ค่าตัว', 'ROI', 'สถานะ', ''].map((h, i) => (
                  <th key={i} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-faint">กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-faint">ไม่พบ KOL ที่ตรงเงื่อนไข</td></tr>
              ) : (
                filtered.map((k) => (
                  <tr key={k.id} onClick={() => nav('/kols/' + k.id)} className="cursor-pointer border-t border-line transition hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={k.name} seed={k.id} />
                        <div>
                          <div className="font-semibold">{k.name}</div>
                          <div className="text-xs text-faint">{k.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{k.category}</td>
                    <td className="px-4 py-3"><TierBadge tier={k.tier} /></td>
                    <td className="px-4 py-3"><PlatformChips platforms={k.platforms} /></td>
                    <td className="tnum whitespace-nowrap px-4 py-3 font-semibold">{fmt(k.followers)}</td>
                    <td className="px-4 py-3"><Engagement value={k.engagement_rate} /></td>
                    <td className="tnum whitespace-nowrap px-4 py-3">{baht(k.rate_per_post)}</td>
                    <td className="tnum whitespace-nowrap px-4 py-3 font-semibold">{k.roi.toFixed(1)}x</td>
                    <td className="px-4 py-3"><StatusBadge status={k.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEdit(k)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-fg"><Pencil size={15} /></button>
                        {isSuperAdmin && (
                          <button onClick={() => setConfirmTarget(k)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-3 text-[13px] text-faint">พบ {filtered.length} คน</div>

      <KolForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} initial={editing} />

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="ลบ KOL"
        message={`ต้องการลบ "${confirmTarget?.name}" ออกจากระบบใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`}
      />
    </div>
  )
}
