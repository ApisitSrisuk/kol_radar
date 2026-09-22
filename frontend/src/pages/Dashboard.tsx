import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Eye, Heart, Wallet, Megaphone, ArrowUpRight, Sparkles } from 'lucide-react'
import { useData } from '../hooks/DataContext'
import { seedSampleData } from '../lib/sampleData'
import { Card, CardHeader, Button } from '../components/ui'
import { Avatar, PlatformChips, Engagement } from '../components/common'
import { TrendChart, DonutChart, BarsChart } from '../components/charts'
import { PLATFORMS, ALL_PLATFORMS } from '../lib/constants'
import { fmt, baht } from '../lib/format'
import type { Platform } from '../types'

function Kpi({ icon, tint, label, value, delta, up }: {
  icon: ReactNode; tint: string; label: string; value: string; delta?: string; up?: boolean
}) {
  return (
    <Card className="p-[18px]">
      <div className="flex items-center justify-between text-[12.5px] text-muted">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-[9px]" style={{ background: tint, color: 'var(--fg)' }}>
          {icon}
        </span>
      </div>
      <div className="tnum mt-3 font-display text-[27px] font-semibold tracking-tight">{value}</div>
      {delta && (
        <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: up ? 'var(--good)' : 'var(--bad)' }}>
          <ArrowUpRight size={13} className={up ? '' : 'rotate-90'} />
          {delta}
        </div>
      )}
    </Card>
  )
}

const MONTHS = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

export function Dashboard() {
  const { kols, loading, campaigns, refreshAll } = useData()
  const nav = useNavigate()
  const [seeding, setSeeding] = useState(false)

  const doSeed = async () => {
    setSeeding(true)
    try {
      await seedSampleData()
      await refreshAll()
    } catch (e) {
      alert('โหลดข้อมูลตัวอย่างไม่สำเร็จ: ' + (e as Error).message)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) return <SkeletonGrid />

  if (kols.length === 0) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Sparkles size={28} />
          </div>
          <h3 className="mb-1 text-xl font-semibold">ยังไม่มีข้อมูล KOL</h3>
          <p className="mb-5 text-sm text-muted">
            เริ่มต้นด้วยการโหลดข้อมูลตัวอย่าง (12 KOL + 6 แคมเปญ) เพื่อดูภาพรวมทันที
            หรือไปที่หน้า “รายชื่อ KOL” เพื่อเพิ่มเอง
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={doSeed} disabled={seeding}>
              <Sparkles size={16} />
              {seeding ? 'กำลังโหลด...' : 'โหลดข้อมูลตัวอย่าง'}
            </Button>
            <Button variant="outline" onClick={() => nav('/kols')}>เพิ่ม KOL เอง</Button>
          </div>
        </div>
      </div>
    )
  }

  const totFollowers = kols.reduce((s, k) => s + k.followers, 0)
  const avgEng = kols.reduce((s, k) => s + k.engagement_rate, 0) / kols.length
  const spend = campaigns.reduce((s, c) => s + c.spent, 0)
  const activeCamps = campaigns.filter((c) => c.stage === 'active').length
  const top = [...kols].sort((a, b) => b.roi - a.roi).slice(0, 5)

  const pd: Record<string, number> = {}
  kols.forEach((k) => k.platforms.forEach((p) => {
    pd[p] = (pd[p] ?? 0) + k.followers / k.platforms.length
  }))
  const donutData = ALL_PLATFORMS.filter((p) => pd[p]).map((p: Platform) => ({
    name: PLATFORMS[p].name, value: Math.round(pd[p]), color: PLATFORMS[p].color,
  }))

  const trend = MONTHS.map((label, i) => ({
    label,
    eng: +(avgEng * (0.68 + i * 0.065)).toFixed(1),
    roi: +((kols.reduce((s, k) => s + k.roi, 0) / kols.length) * (0.72 + i * 0.056)).toFixed(1),
  }))

  const budgetBars = [...campaigns]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6)
    .map((c) => ({ label: c.brand || c.name.slice(0, 8), spent: c.spent }))

  return (
    <div className="space-y-4">
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <Kpi icon={<Users size={17} />} tint="var(--accent-soft)" label="KOL ทั้งหมด" value={String(kols.length)} delta="ทุกแพลตฟอร์ม" up />
        <Kpi icon={<Eye size={17} />} tint="rgba(14,165,183,.15)" label="Reach รวม" value={fmt(totFollowers)} delta="8.7%" up />
        <Kpi icon={<Heart size={17} />} tint="var(--good-soft,rgba(18,164,106,.15))" label="Engagement เฉลี่ย" value={avgEng.toFixed(1) + '%'} delta="0.6%" up />
        <Kpi icon={<Wallet size={17} />} tint="rgba(224,130,26,.16)" label="งบที่ใช้ไป" value={baht(spend)} />
        <Kpi icon={<Megaphone size={17} />} tint="rgba(124,92,252,.15)" label="แคมเปญที่ทำอยู่" value={`${activeCamps} / ${campaigns.length}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="แนวโน้ม Engagement & ROI" hint="6 เดือนล่าสุด (ประมาณการ)" />
          <div className="p-[18px]">
            <TrendChart
              data={trend}
              lines={[
                { key: 'eng', name: 'Engagement (%)', color: 'var(--accent)' },
                { key: 'roi', name: 'ROI (เท่า)', color: 'var(--cyan)' },
              ]}
            />
            <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] text-muted">
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded" style={{ background: 'var(--accent)' }} />Engagement rate</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded" style={{ background: 'var(--cyan)' }} />ROI เฉลี่ย</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="สัดส่วนตามแพลตฟอร์ม" />
          <div className="p-[18px]">
            <DonutChart data={donutData} />
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-[12.5px] text-muted">
              {donutData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded" style={{ background: d.color }} />{d.name} · {fmt(d.value)}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="KOL ทำผลงานดีที่สุด" hint="เรียงตาม ROI" />
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-semibold">KOL</th>
                  <th className="px-4 py-3 font-semibold">แพลตฟอร์ม</th>
                  <th className="px-4 py-3 font-semibold">Engagement</th>
                  <th className="px-4 py-3 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody>
                {top.map((k) => (
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
                    <td className="px-4 py-3"><PlatformChips platforms={k.platforms} /></td>
                    <td className="px-4 py-3"><Engagement value={k.engagement_rate} /></td>
                    <td className="tnum px-4 py-3 font-semibold">{k.roi.toFixed(1)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="งบที่ใช้ตามแคมเปญ" hint="Top 6 · หน่วยบาท" />
          <div className="p-[18px]">
            <BarsChart data={budgetBars} dataKey="spent" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl2 border border-line bg-surface" />
      ))}
    </div>
  )
}
