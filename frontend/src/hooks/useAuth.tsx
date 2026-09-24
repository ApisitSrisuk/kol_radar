import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { LOCAL_MODE } from '../lib/repo'

export type Role = 'super_admin' | 'admin' | 'kol' | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  role: Role
  isSuperAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role>(LOCAL_MODE ? 'super_admin' : null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // ดึง role ของผู้ใช้จากตาราง profiles (โหมด Local = super_admin เสมอ)
  const uid = session?.user?.id
  useEffect(() => {
    if (LOCAL_MODE) {
      setRole('super_admin')
      return
    }
    if (!uid) {
      setRole(null)
      return
    }
    let alive = true
    supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setRole(((data?.role as Role) ?? 'admin'))
      })
      .catch(() => {
        if (alive) setRole('admin')
      })
    return () => {
      alive = false
    }
  }, [uid])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        role,
        isSuperAdmin: role === 'super_admin',
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
