/**
 * ระบบแชท 1-1 ระหว่างทีมการตลาด (team) กับ KOL (kol)
 * แต่ละบทสนทนาผูกกับ kol_id หนึ่งคน (team คุยกับ KOL คนนั้น)
 * โหมด Local เก็บใน localStorage · โหมด Supabase ใช้ตาราง messages
 */
import { supabase } from './supabase'
import { LOCAL_MODE } from './repo'

export type Sender = 'team' | 'kol'

export interface ChatMessage {
  id: string
  kol_id: string
  sender: Sender
  text: string
  created_at: string
  /** ข้อความนี้ถูกเด้งเข้า LINE ของ KOL ด้วย */
  via_line?: boolean
}

export interface ThreadMeta {
  kol_id: string
  last?: ChatMessage
  count: number
}

const KEY = 'kol-radar-chat'

const loadAll = (): ChatMessage[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as ChatMessage[]
  } catch {
    return []
  }
}
const saveAll = (arr: ChatMessage[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'm-' + Math.random().toString(36).slice(2) + Date.now()

const byTime = (a: ChatMessage, b: ChatMessage) => (a.created_at < b.created_at ? -1 : 1)

export async function fetchMessages(kolId: string): Promise<ChatMessage[]> {
  if (LOCAL_MODE) return loadAll().filter((m) => m.kol_id === kolId).sort(byTime)
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('kol_id', kolId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ChatMessage[]
}

export async function sendMessage(
  kolId: string,
  sender: Sender,
  text: string,
  viaLine = false
): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: uid(),
    kol_id: kolId,
    sender,
    text,
    created_at: new Date().toISOString(),
    via_line: viaLine || undefined,
  }
  if (LOCAL_MODE) {
    const arr = loadAll()
    arr.push(msg)
    saveAll(arr)
    return msg
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({ kol_id: kolId, sender, text, via_line: viaLine })
    .select('*')
    .single()
  if (error) throw error
  return data as ChatMessage
}

/** สรุปบทสนทนาทั้งหมด (สำหรับหน้ารายการแชทฝั่งทีม): kol_id -> ข้อความล่าสุด + จำนวน */
export async function fetchThreadsMeta(): Promise<Record<string, ThreadMeta>> {
  let msgs: ChatMessage[]
  if (LOCAL_MODE) msgs = loadAll()
  else {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    msgs = (data ?? []) as ChatMessage[]
  }
  const map: Record<string, ThreadMeta> = {}
  for (const m of msgs.sort(byTime)) {
    const t = map[m.kol_id] ?? { kol_id: m.kol_id, count: 0 }
    t.count++
    t.last = m
    map[m.kol_id] = t
  }
  return map
}

/** แจ้งเตือนเมื่อมีข้อความใหม่จากแท็บอื่น (โหมด Local) — คืน unsubscribe */
export function onChatChange(cb: () => void): () => void {
  if (!LOCAL_MODE) return () => {}
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) cb()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

/** เรียลไทม์: ฟังข้อความใหม่ของ KOL คนเดียว — Local ใช้ storage event / Supabase ใช้ Realtime */
export function subscribeMessages(kolId: string, cb: () => void): () => void {
  if (LOCAL_MODE) return onChatChange(cb)
  const ch = supabase
    .channel(`msg-${kolId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `kol_id=eq.${kolId}` },
      () => cb()
    )
    .subscribe()
  return () => {
    supabase.removeChannel(ch)
  }
}

/** เรียลไทม์: ฟังข้อความใหม่ทุก KOL (สำหรับรายการแชทฝั่งทีม) */
export function subscribeAllMessages(cb: () => void): () => void {
  if (LOCAL_MODE) return onChatChange(cb)
  const ch = supabase
    .channel('msg-all')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => cb())
    .subscribe()
  return () => {
    supabase.removeChannel(ch)
  }
}
