import type { ReactNode } from 'react'
import type { Platform, Tier, KolStatus, CampaignStage } from '../types'

interface PlatformInfo {
  name: string
  color: string
  icon: ReactNode
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  tiktok: {
    name: 'TikTok',
    color: '#F0295A',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M16.5 3c.3 2.1 1.6 3.7 3.7 4v2.4c-1.3 0-2.6-.4-3.7-1.1v6.1c0 3.1-2.5 5.6-5.6 5.6S5.3 17.5 5.3 14.4 7.8 8.8 11 8.8c.3 0 .6 0 .9.1v2.5c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.4-3 3.1s1.4 3.1 3 3.1 3.1-1.3 3.1-3V3h2.4z" />
      </svg>
    ),
  },
  ig: {
    name: 'Instagram',
    color: '#DD2A7B',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="100%" height="100%">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  yt: {
    name: 'YouTube',
    color: '#FF3B30',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M22 8.2a3 3 0 0 0-2-2C18.2 5.7 12 5.7 12 5.7s-6.2 0-8 .5a3 3 0 0 0-2 2C1.5 10 1.5 12 1.5 12s0 2 .5 3.8a3 3 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a3 3 0 0 0 2-2c.5-1.8.5-3.8.5-3.8s0-2-.5-3.8zM10 15V9l5 3z" />
      </svg>
    ),
  },
  fb: {
    name: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  x: {
    name: 'X',
    color: '#0F1419',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M18.2 3h3.3l-7.2 8.3L23 21h-6.6l-5.2-6.8L5.2 21H1.9l7.7-8.9L1.5 3h6.8l4.7 6.2L18.2 3zm-1.2 16h1.8L7.1 4.8H5.2L17 19z" />
      </svg>
    ),
  },
}

export const ALL_PLATFORMS = Object.keys(PLATFORMS) as Platform[]

export const TIER_LABEL: Record<Tier, string> = {
  nano: 'Nano',
  micro: 'Micro',
  mid: 'Mid',
  macro: 'Macro',
  mega: 'Mega',
}
export const ALL_TIERS = Object.keys(TIER_LABEL) as Tier[]

/** คำนวณ tier อัตโนมัติจากจำนวน followers */
export function tierFromFollowers(followers: number): Tier {
  if (followers >= 3_000_000) return 'mega'
  if (followers >= 1_000_000) return 'macro'
  if (followers >= 250_000) return 'mid'
  if (followers >= 50_000) return 'micro'
  return 'nano'
}

export const STATUS_LABEL: Record<KolStatus, string> = {
  active: 'กำลังทำงาน',
  pending: 'รออนุมัติ',
  paused: 'พัก',
}
export const ALL_STATUSES = Object.keys(STATUS_LABEL) as KolStatus[]

export const STAGE: Record<CampaignStage, { label: string; color: string }> = {
  planning: { label: 'วางแผน', color: 'var(--faint)' },
  active: { label: 'กำลังทำงาน', color: 'var(--good)' },
  review: { label: 'รอตรวจสอบ', color: 'var(--warn)' },
  done: { label: 'เสร็จสิ้น', color: 'var(--cyan)' },
}
export const ALL_STAGES = Object.keys(STAGE) as CampaignStage[]

export const CATEGORIES = [
  'ความงาม', 'อาหาร', 'แฟชั่น', 'เทคโนโลยี', 'เกม',
  'ไลฟ์สไตล์', 'ท่องเที่ยว', 'สุขภาพ', 'ครอบครัว',
]

/** สีชุด categorical สำหรับกราฟ */
export const CHART_COLORS = [
  '#EC4079', '#0EA5B7', '#7C5CFC', '#12A46A', '#E0821A',
  '#E0483C', '#3B82F6', '#EC7B4A', '#14B8A6', '#D946A0',
]
