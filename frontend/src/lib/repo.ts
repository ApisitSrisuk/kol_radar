/**
 * Data repository — สลับระหว่าง Supabase (ของจริง) กับ localStorage (โหมด Local)
 * โดยอัตโนมัติตามว่าได้ตั้งค่า Supabase หรือยัง (isConfigured)
 */
import { supabase, isConfigured } from './supabase'
import type { Kol, KolInput, Campaign, CampaignInput } from '../types'

export const LOCAL_MODE = !isConfigured

// ======================= LOCAL (localStorage) =======================
const LS_KEY = 'kol-radar-db'
interface LocalDB {
  kols: Kol[]
  campaigns: Omit<Campaign, 'kol_ids'>[]
  links: { campaign_id: string; kol_id: string }[]
}
const emptyDb = (): LocalDB => ({ kols: [], campaigns: [], links: [] })

function load(): LocalDB {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return { ...emptyDb(), ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return emptyDb()
}
function save(db: LocalDB) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
}
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now()

// ======================= KOLS =======================
export async function fetchKols(): Promise<Kol[]> {
  if (LOCAL_MODE) {
    return [...load().kols].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }
  const { data, error } = await supabase
    .from('kols')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Kol[]
}

export async function addKol(input: KolInput): Promise<Kol> {
  if (LOCAL_MODE) {
    const db = load()
    const kol: Kol = { ...input, id: uid(), owner_id: 'local', created_at: new Date().toISOString() }
    db.kols.push(kol)
    save(db)
    return kol
  }
  const { data, error } = await supabase.from('kols').insert(input).select('*').single()
  if (error) throw error
  return data as Kol
}

export async function updateKol(id: string, input: KolInput): Promise<Kol> {
  if (LOCAL_MODE) {
    const db = load()
    const idx = db.kols.findIndex((k) => k.id === id)
    if (idx < 0) throw new Error('ไม่พบ KOL')
    db.kols[idx] = { ...db.kols[idx], ...input }
    save(db)
    return db.kols[idx]
  }
  const { data, error } = await supabase.from('kols').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data as Kol
}

export async function removeKol(id: string): Promise<void> {
  if (LOCAL_MODE) {
    const db = load()
    db.kols = db.kols.filter((k) => k.id !== id)
    db.links = db.links.filter((l) => l.kol_id !== id)
    save(db)
    return
  }
  const { error } = await supabase.from('kols').delete().eq('id', id)
  if (error) throw error
}

// ======================= CAMPAIGNS =======================
export async function fetchCampaigns(): Promise<Campaign[]> {
  if (LOCAL_MODE) {
    const db = load()
    const byC = new Map<string, string[]>()
    db.links.forEach((l) => {
      const arr = byC.get(l.campaign_id) ?? []
      arr.push(l.kol_id)
      byC.set(l.campaign_id, arr)
    })
    return [...db.campaigns]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((c) => ({ ...c, kol_ids: byC.get(c.id) ?? [] }))
  }
  const [{ data: rows, error: e1 }, { data: links, error: e2 }] = await Promise.all([
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('campaign_kols').select('campaign_id, kol_id'),
  ])
  if (e1 || e2) throw e1 ?? e2
  const byC = new Map<string, string[]>()
  ;(links ?? []).forEach((l: { campaign_id: string; kol_id: string }) => {
    const arr = byC.get(l.campaign_id) ?? []
    arr.push(l.kol_id)
    byC.set(l.campaign_id, arr)
  })
  return ((rows ?? []) as Omit<Campaign, 'kol_ids'>[]).map((r) => ({
    ...r,
    kol_ids: byC.get(r.id) ?? [],
  }))
}

async function syncLinks(campaignId: string, kolIds: string[]) {
  if (LOCAL_MODE) {
    const db = load()
    db.links = db.links.filter((l) => l.campaign_id !== campaignId)
    kolIds.forEach((kid) => db.links.push({ campaign_id: campaignId, kol_id: kid }))
    save(db)
    return
  }
  await supabase.from('campaign_kols').delete().eq('campaign_id', campaignId)
  if (kolIds.length) {
    const { error } = await supabase
      .from('campaign_kols')
      .insert(kolIds.map((kol_id) => ({ campaign_id: campaignId, kol_id })))
    if (error) throw error
  }
}

export async function addCampaign(input: CampaignInput): Promise<void> {
  const { kol_ids, ...row } = input
  if (LOCAL_MODE) {
    const db = load()
    const id = uid()
    db.campaigns.push({ ...row, id, owner_id: 'local', created_at: new Date().toISOString() })
    save(db)
    await syncLinks(id, kol_ids)
    return
  }
  const { data, error } = await supabase.from('campaigns').insert(row).select('id').single()
  if (error) throw error
  await syncLinks((data as { id: string }).id, kol_ids)
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<void> {
  const { kol_ids, ...row } = input
  if (LOCAL_MODE) {
    const db = load()
    const idx = db.campaigns.findIndex((c) => c.id === id)
    if (idx >= 0) db.campaigns[idx] = { ...db.campaigns[idx], ...row }
    save(db)
    await syncLinks(id, kol_ids)
    return
  }
  const { error } = await supabase.from('campaigns').update(row).eq('id', id)
  if (error) throw error
  await syncLinks(id, kol_ids)
}

export async function removeCampaign(id: string): Promise<void> {
  if (LOCAL_MODE) {
    const db = load()
    db.campaigns = db.campaigns.filter((c) => c.id !== id)
    db.links = db.links.filter((l) => l.campaign_id !== id)
    save(db)
    return
  }
  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) throw error
}
