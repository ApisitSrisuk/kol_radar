import { useOutletContext } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { useData } from '../../hooks/DataContext'
import { Card, CardHeader } from '../../components/ui'
import { StageBadge } from '../../components/common'
import { fmt, baht } from '../../lib/format'

export function PortalCampaigns() {
  const { kolId } = useOutletContext<{ kolId: string }>()
  const { campaigns, campaignsLoading } = useData()
  const mine = campaigns.filter((c) => c.kol_ids.includes(kolId))

  if (campaignsLoading) return <div className="py-16 text-center text-faint">กำลังโหลด...</div>

  if (mine.length === 0) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Megaphone size={28} />
        </div>
        <h3 className="mb-1 text-xl font-semibold">ยังไม่มีแคมเปญ</h3>
        <p className="text-sm text-muted">เมื่อทีมงานเชิญคุณเข้าร่วมแคมเปญ จะแสดงที่นี่</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((c) => {
          const prog = c.budget ? Math.round((c.spent / c.budget) * 100) : 0
          return (
            <Card key={c.id}>
              <div className="p-[18px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11.5px] font-semibold text-accent-ink">{c.brand || '—'}</div>
                    <h3 className="mt-0.5 text-[16px] font-semibold">{c.name}</h3>
                  </div>
                  <StageBadge stage={c.stage} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-2 p-3">
                    <div className="text-[11.5px] text-faint">Reach</div>
                    <div className="tnum mt-0.5 font-display text-lg font-semibold">{fmt(c.reach)}</div>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-3">
                    <div className="text-[11.5px] text-faint">Conversions</div>
                    <div className="tnum mt-0.5 font-display text-lg font-semibold">{fmt(c.conversions)}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
                    <span>ความคืบหน้างบ</span>
                    <span className="tnum">{baht(c.spent)} / {baht(c.budget)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded bg-surface-3">
                    <i className="block h-full rounded" style={{ width: prog + '%', background: 'linear-gradient(90deg,var(--accent),#FF8A5B)' }} />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
