import { useOutletContext, useNavigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Users, Heart, TrendingUp, Wallet, Megaphone, Clock } from 'lucide-react'
import { useData } from '../../hooks/DataContext'
import { Card, CardHeader, Button } from '../../components/ui'
import { PlatformChips, TierBadge, StatusBadge } from '../../components/common'
import { TrendChart } from '../../components/charts'
import { PLATFORMS } from '../../lib/constants'
import { fmt, baht } from '../../lib/format'

const MONTHS = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

function Stat({ icon, tint, label, value }: { icon: ReactNode; tint: string; label: string; value: string }) {
  return (
    <Card className="p-[18px]">
      <div className="flex items-center justify-between text-[12.5px] text-muted">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-[9px]" style={{ background: tint }}>{icon}</span>
      </div>
      <div className="tnum mt-3 font-display text-[26px] font-semibold tracking-tight">{value}</div>
    </Card>
  )
}

export function PortalDashboard() {
  const { kolId } = useOutletContext<{ kolId: string }>()
  const { kols, campaigns } = useData()
  const nav = useNavigate()
  const me = kols.find((k) => k.id === kolId)
  if (!me) return <div className="py-16 text-center text-faint">ไม่พบข้อมูล</div>

  const myCamps = campaigns.filter((c) => c.kol_ids.includes(me.id))
  const g = me.growth / 100
  const growth = MONTHS.map((label, i) => ({
    label,
    followers: Math.round(me.followers / Math.pow(1 + g / 6, 5 - i)),
  }))

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="p-[18px]">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-semibold">สวัสดี, {me.name} 👋</h2>
              <TierBadge tier={me.tier} />
              <StatusBadge status={me.status} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-faint">
              <span>{me.handle}</span>·<PlatformChips platforms={me.platforms} />
            </div>
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => nav('/profile')}>
            แก้ไขโปรไฟล์
          </Button>
        </div>
        {me.status === 'pending' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warn-soft px-3 py-2 text-[13px] text-warn">
            <Clock size={16} /> ใบสมัครของคุณอยู่ระหว่างรอทีมงานอนุมัติ
          </div>
        )}
      </Card>

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <Stat icon={<Users size={17} />} tint="var(--accent-soft)" label="Followers" value={fmt(me.followers)} />
        <Stat icon={<Heart size={17} />} tint="var(--good-soft)" label="Engagement" value={me.engagement_rate.toFixed(1) + '%'} />
        <Stat icon={<TrendingUp size={17} />} tint="rgba(14,165,183,.15)" label="ROI" value={me.roi.toFixed(1) + 'x'} />
        <Stat icon={<Wallet size={17} />} tint="rgba(224,130,26,.16)" label="ค่าตัว/โพสต์" value={baht(me.rate_per_post)} />
        <Stat icon={<Megaphone size={17} />} tint="rgba(124,92,252,.15)" label="แคมเปญที่ร่วม" value={String(myCamps.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="การเติบโตของผู้ติดตาม"
            action={
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
                style={{ background: 'var(--surface-3)', color: me.growth >= 0 ? 'var(--good)' : 'var(--bad)' }}
              >
                {me.growth >= 0 ? '+' : ''}{me.growth}%
              </span>
            }
          />
          <div className="p-[18px]">
            <TrendChart data={growth} lines={[{ key: 'followers', name: 'Followers', color: 'var(--accent)' }]} height={200} />
          </div>
        </Card>
        <Card>
          <CardHeader title="แพลตฟอร์มของฉัน" />
          <div className="space-y-2 p-[18px]">
            {me.platforms.map((p) => (
              <div key={p} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: PLATFORMS[p].color, padding: 7 }}>
                  {PLATFORMS[p].icon}
                </span>
                <span className="font-medium">{PLATFORMS[p].name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
