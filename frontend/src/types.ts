export type Platform = 'tiktok' | 'ig' | 'yt' | 'fb' | 'x'
export type Tier = 'nano' | 'micro' | 'mid' | 'macro' | 'mega'
export type KolStatus = 'active' | 'pending' | 'paused'
export type CampaignStage = 'planning' | 'active' | 'review' | 'done'

export interface Kol {
  id: string
  owner_id: string
  name: string
  handle: string
  category: string
  tier: Tier
  platforms: Platform[]
  followers: number
  engagement_rate: number
  avg_views: number
  rate_per_post: number
  status: KolStatus
  roi: number
  growth: number
  contact?: string
  created_at: string
}

export interface Campaign {
  id: string
  owner_id: string
  name: string
  brand: string
  stage: CampaignStage
  budget: number
  spent: number
  reach: number
  conversions: number
  start_date: string | null
  end_date: string | null
  created_at: string
  kol_ids: string[]
}

/** ข้อมูลที่ใช้ตอนสร้าง/แก้ (ไม่รวม field ที่ระบบสร้างเอง) */
export type KolInput = Omit<Kol, 'id' | 'owner_id' | 'created_at'>
export type CampaignInput = Omit<
  Campaign,
  'id' | 'owner_id' | 'created_at' | 'kol_ids'
> & { kol_ids: string[] }
