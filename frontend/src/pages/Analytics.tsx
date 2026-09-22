import { useData } from '../hooks/DataContext'
import { Card, CardHeader } from '../components/ui'
import { HBarChart, DonutChart, BarsChart, BubbleChart } from '../components/charts'
import { PLATFORMS, ALL_PLATFORMS, CHART_COLORS } from '../lib/constants'
import type { Platform } from '../types'

const MONTHS = ['เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.']

export function Analytics() {
  const { kols, campaigns, loading } = useData()

  if (loading) return <div className="py-16 text-center text-faint">กำลังโหลด...</div>
  if (kols.length === 0)
    return <div className="py-16 text-center text-faint">ยังไม่มีข้อมูล — เพิ่ม KOL หรือโหลดข้อมูลตัวอย่างในหน้าภาพรวมก่อน</div>

  const topRoi = [...kols].sort((a, b) => b.roi - a.roi).slice(0, 6).map((k, i) => ({
    label: k.name.length > 12 ? k.name.slice(0, 11) + '…' : k.name,
    value: k.roi,
    display: k.roi.toFixed(1) + 'x',
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const cats: Record<string, number> = {}
  kols.forEach((k) => { cats[k.category] = (cats[k.category] ?? 0) + 1 })
  const catData = Object.entries(cats).map(([name, value], i) => ({
    name, value, color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const pe: Record<string, number> = {}
  const pc: Record<string, number> = {}
  kols.forEach((k) => k.platforms.forEach((p) => {
    pe[p] = (pe[p] ?? 0) + k.engagement_rate
    pc[p] = (pc[p] ?? 0) + 1
  }))
  const engRows = ALL_PLATFORMS.filter((p) => pc[p]).map((p: Platform) => ({
    label: PLATFORMS[p].name,
    value: +(pe[p] / pc[p]).toFixed(1),
    display: (pe[p] / pc[p]).toFixed(1) + '%',
    color: PLATFORMS[p].color,
  })).sort((a, b) => b.value - a.value)

  const totConv = campaigns.reduce((s, c) => s + c.conversions, 0)
  const convBase = totConv || 5000
  const convData = MONTHS.map((label, i) => ({
    label,
    conv: Math.round((convBase / 6) * (0.4 + i * 0.24)),
  }))

  const bubble = kols.map((k) => ({
    x: k.followers,
    y: k.engagement_rate,
    z: k.rate_per_post,
    name: k.name,
    color: CHART_COLORS[kols.indexOf(k) % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="ROI สูงสุดรายบุคคล" hint="Top 6" />
          <div className="p-[18px]"><HBarChart data={topRoi} /></div>
        </Card>
        <Card>
          <CardHeader title="สัดส่วน KOL ตามหมวดหมู่" />
          <div className="p-[18px]">
            <DonutChart data={catData} />
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-[12.5px] text-muted">
              {catData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded" style={{ background: d.color }} />{d.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Engagement เฉลี่ยตามแพลตฟอร์ม" />
          <div className="p-[18px]"><HBarChart data={engRows} /></div>
        </Card>
        <Card>
          <CardHeader title="Conversions รายเดือน" hint="ทุกแคมเปญ (ประมาณการ)" />
          <div className="p-[18px]"><BarsChart data={convData} dataKey="conv" color="var(--cyan)" /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="เปรียบเทียบ Reach vs Engagement" hint="ขนาดวงกลม = ค่าตัว/โพสต์" />
        <div className="p-[18px]"><BubbleChart data={bubble} /></div>
      </Card>
    </div>
  )
}
