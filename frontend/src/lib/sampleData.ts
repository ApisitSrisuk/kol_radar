import * as repo from './repo'
import type { KolInput, CampaignInput } from '../types'

export const SAMPLE_KOLS: KolInput[] = [
  { name: 'ญาญ่า บิวตี้', handle: '@yaya.beauty', category: 'ความงาม', tier: 'macro', platforms: ['ig', 'tiktok', 'yt'], followers: 2400000, engagement_rate: 6.8, avg_views: 850000, rate_per_post: 120000, status: 'active', roi: 4.2, growth: 8.4 },
  { name: 'พี่จอง Tech', handle: '@jong.tech', category: 'เทคโนโลยี', tier: 'mid', platforms: ['yt', 'fb', 'x'], followers: 680000, engagement_rate: 5.1, avg_views: 210000, rate_per_post: 55000, status: 'active', roi: 3.6, growth: 5.2 },
  { name: 'หมูอ้วนกินทุกอย่าง', handle: '@moowin.eat', category: 'อาหาร', tier: 'macro', platforms: ['tiktok', 'ig', 'fb'], followers: 1800000, engagement_rate: 9.2, avg_views: 1200000, rate_per_post: 95000, status: 'active', roi: 5.1, growth: 12.1 },
  { name: 'Nina Fashionista', handle: '@ninastyle', category: 'แฟชั่น', tier: 'mid', platforms: ['ig', 'tiktok'], followers: 540000, engagement_rate: 4.3, avg_views: 180000, rate_per_post: 48000, status: 'pending', roi: 2.9, growth: -1.4 },
  { name: 'เกมเมอร์ต้น', handle: '@ton.gaming', category: 'เกม', tier: 'mega', platforms: ['yt', 'tiktok', 'fb'], followers: 5200000, engagement_rate: 3.9, avg_views: 2100000, rate_per_post: 280000, status: 'active', roi: 3.1, growth: 6.7 },
  { name: 'มินิมอลลิสต์เมย์', handle: '@may.minimal', category: 'ไลฟ์สไตล์', tier: 'micro', platforms: ['ig', 'x'], followers: 98000, engagement_rate: 8.7, avg_views: 34000, rate_per_post: 12000, status: 'active', roi: 6.3, growth: 15.3 },
  { name: 'เที่ยวกับบาส', handle: '@bas.travels', category: 'ท่องเที่ยว', tier: 'mid', platforms: ['yt', 'ig', 'tiktok'], followers: 430000, engagement_rate: 5.6, avg_views: 160000, rate_per_post: 42000, status: 'paused', roi: 3.3, growth: 2.1 },
  { name: 'Dr.ผิวใส', handle: '@drskincare', category: 'ความงาม', tier: 'micro', platforms: ['tiktok', 'fb'], followers: 145000, engagement_rate: 7.4, avg_views: 88000, rate_per_post: 18000, status: 'active', roi: 4.9, growth: 9.8 },
  { name: 'ครัวคุณแม่', handle: '@mom.kitchen', category: 'อาหาร', tier: 'micro', platforms: ['fb', 'yt'], followers: 210000, engagement_rate: 6.1, avg_views: 72000, rate_per_post: 22000, status: 'active', roi: 4.4, growth: 4.5 },
  { name: 'ฟิตแอนด์เฟิร์ม', handle: '@fit.firm', category: 'สุขภาพ', tier: 'nano', platforms: ['ig', 'tiktok'], followers: 42000, engagement_rate: 11.2, avg_views: 19000, rate_per_post: 6000, status: 'pending', roi: 7.1, growth: 22.6 },
  { name: 'รีวิวของเล่นน้องมิว', handle: '@miu.toys', category: 'ครอบครัว', tier: 'mid', platforms: ['yt', 'fb', 'tiktok'], followers: 720000, engagement_rate: 5.9, avg_views: 340000, rate_per_post: 60000, status: 'active', roi: 3.8, growth: 7.2 },
  { name: 'คาเฟ่ฮอปเปอร์', handle: '@cafe.hopper', category: 'ไลฟ์สไตล์', tier: 'micro', platforms: ['ig', 'tiktok'], followers: 167000, engagement_rate: 8.1, avg_views: 58000, rate_per_post: 19000, status: 'active', roi: 5.5, growth: 11.4 },
]

/** แคมเปญตัวอย่าง — kolIdx อ้างอิง index ใน SAMPLE_KOLS */
const SAMPLE_CAMPAIGNS: (Omit<CampaignInput, 'kol_ids'> & { kolIdx: number[] })[] = [
  { name: 'เปิดตัวเซรั่มใหม่ Q3', brand: 'GlowLab', stage: 'active', budget: 850000, spent: 520000, reach: 8200000, conversions: 4300, start_date: null, end_date: null, kolIdx: [0, 7, 5] },
  { name: 'รีวิวมือถือรุ่นเรือธง', brand: 'TechNova', stage: 'active', budget: 600000, spent: 340000, reach: 3100000, conversions: 1800, start_date: null, end_date: null, kolIdx: [1, 4] },
  { name: 'แคมเปญเมนูใหม่ร้านอาหาร', brand: 'อร่อยดี', stage: 'review', budget: 400000, spent: 400000, reach: 5600000, conversions: 6200, start_date: null, end_date: null, kolIdx: [2, 8] },
  { name: 'คอลเลกชันเสื้อผ้าหน้าร้อน', brand: 'UrbanWear', stage: 'planning', budget: 520000, spent: 60000, reach: 0, conversions: 0, start_date: null, end_date: null, kolIdx: [3, 11] },
  { name: 'ทริปโปรโมทที่พัก', brand: 'StayThai', stage: 'done', budget: 300000, spent: 295000, reach: 2400000, conversions: 980, start_date: null, end_date: null, kolIdx: [6, 10] },
  { name: 'ชาเลนจ์ออกกำลังกาย 30 วัน', brand: 'FitZone', stage: 'active', budget: 250000, spent: 120000, reach: 1900000, conversions: 2100, start_date: null, end_date: null, kolIdx: [9, 5] },
]

/**
 * ใส่ข้อมูลตัวอย่างทั้งหมดให้ผู้ใช้ปัจจุบัน
 * ทำงานได้ทั้งโหมด Supabase และโหมด Local (ผ่าน repo)
 */
export async function seedSampleData(): Promise<void> {
  // 1) เพิ่ม KOL ทีละคน เก็บ id ที่ได้
  const kolIds: string[] = []
  for (const k of SAMPLE_KOLS) {
    const created = await repo.addKol({ ...k, line_id: k.line_id ?? k.handle.replace('@', '') })
    kolIds.push(created.id)
  }

  // 2) เพิ่มแคมเปญ พร้อมผูก KOL ตาม index
  for (const { kolIdx, ...c } of SAMPLE_CAMPAIGNS) {
    const kol_ids = kolIdx.map((i) => kolIds[i]).filter(Boolean)
    const campaign: CampaignInput = { ...c, kol_ids }
    await repo.addCampaign(campaign)
  }
}
