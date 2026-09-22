import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { fmt } from '../lib/format'

const axis = { fontSize: 11, fill: 'var(--faint)' }
const grid = 'var(--line)'
const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--fg)',
  boxShadow: '0 8px 24px -12px rgba(0,0,0,.3)',
}

export function TrendChart({
  data,
  lines,
  height = 230,
}: {
  data: Record<string, number | string>[]
  lines: { key: string; name: string; color: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis
          tick={axis}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmt(Number(v))}
          width={44}
        />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2.4}
            dot={{ r: 3, fill: l.color }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarsChart({
  data,
  dataKey,
  color = 'var(--accent)',
  height = 230,
}: {
  data: Record<string, number | string>[]
  dataKey: string
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis
          tick={axis}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmt(Number(v))}
          width={44}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HBarChart({
  data,
  height,
}: {
  data: { label: string; value: number; color: string; display: string }[]
  height?: number
}) {
  const h = height ?? data.length * 40 + 20
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 44, left: 8, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number; color: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
          stroke="none"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function BubbleChart({
  data,
  height = 300,
}: {
  data: { x: number; y: number; z: number; name: string; color: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 20, left: 4, bottom: 16 }}>
        <CartesianGrid stroke={grid} />
        <XAxis
          type="number"
          dataKey="x"
          name="Followers"
          scale="log"
          domain={['auto', 'auto']}
          tick={axis}
          tickFormatter={(v) => fmt(Number(v))}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Engagement"
          unit="%"
          tick={axis}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <ZAxis type="number" dataKey="z" range={[80, 900]} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(v: number, n: string) =>
            n === 'Followers' ? fmt(v) : n === 'Engagement' ? v + '%' : v
          }
        />
        <Scatter data={data}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} fillOpacity={0.62} stroke={d.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
