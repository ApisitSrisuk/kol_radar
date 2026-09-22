import type { Platform, Tier, KolStatus, CampaignStage } from '../types'
import { PLATFORMS, TIER_LABEL, STATUS_LABEL, STAGE } from '../lib/constants'
import { initials, colorFor } from '../lib/format'

export function Avatar({
  name,
  seed,
  size = 38,
}: {
  name: string
  seed?: string
  size?: number
}) {
  return (
    <span
      className="inline-grid place-items-center rounded-full font-display font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: colorFor(seed ?? name),
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </span>
  )
}

export function PlatformChips({ platforms }: { platforms: Platform[] }) {
  return (
    <span className="inline-flex gap-1.5">
      {platforms.map((p) => (
        <span
          key={p}
          title={PLATFORMS[p].name}
          className="grid place-items-center rounded-md text-white"
          style={{ width: 24, height: 24, background: PLATFORMS[p].color, padding: 5 }}
        >
          {PLATFORMS[p].icon}
        </span>
      ))}
    </span>
  )
}

const tierColor: Record<Tier, string> = {
  nano: 'var(--faint)',
  micro: 'var(--cyan)',
  mid: 'var(--accent-ink)',
  macro: '#7C5CFC',
  mega: 'var(--warn)',
}
export function TierBadge({ tier }: { tier: Tier }) {
  const c = tierColor[tier]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{
        background: `color-mix(in srgb, ${c} 16%, transparent)`,
        color: c,
      }}
    >
      {TIER_LABEL[tier]}
    </span>
  )
}

const statusColor: Record<KolStatus, string> = {
  active: 'var(--good)',
  pending: 'var(--warn)',
  paused: 'var(--faint)',
}
export function StatusBadge({ status }: { status: KolStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{ background: 'var(--surface-3)', color: statusColor[status] }}
    >
      <i
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: statusColor[status] }}
      />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StageBadge({ stage }: { stage: CampaignStage }) {
  const s = STAGE[stage]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{ background: 'var(--surface-3)', color: s.color }}
    >
      <i className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function Engagement({ value }: { value: number }) {
  return (
    <span
      className="tnum font-semibold"
      style={{ color: value < 5 ? 'var(--warn)' : 'var(--good)' }}
    >
      {value.toFixed(1)}%
    </span>
  )
}
