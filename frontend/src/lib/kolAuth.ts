import { supabase } from './supabase'

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string

/** ทีมสร้างบัญชี login (email/password) ให้ KOL — เรียก Edge Function create-kol-login */
export async function createKolLogin(kolId: string, email: string, password: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('ต้องล็อกอินก่อน')

  const res = await fetch(`${SUPA_URL}/functions/v1/create-kol-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kol_id: kolId, email, password }),
  })
  const out = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(out.error || `ล้มเหลว (${res.status})`)
}
