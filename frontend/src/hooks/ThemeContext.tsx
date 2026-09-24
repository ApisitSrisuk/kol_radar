import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

export const ACCENT_PRESETS = [
  { key: 'default', name: 'ชมพู', color: '#EC4079' },
  { key: 'violet', name: 'ม่วง', color: '#7C5CFC' },
  { key: 'blue', name: 'น้ำเงิน', color: '#3B82F6' },
  { key: 'teal', name: 'เขียวมิ้นต์', color: '#14B8A6' },
  { key: 'green', name: 'เขียว', color: '#16A34A' },
  { key: 'orange', name: 'ส้ม', color: '#F97316' },
  { key: 'rose', name: 'แดงกุหลาบ', color: '#F43F5E' },
]

export const DEFAULT_SITE_NAME = 'KOL Radar'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  /** 'default' หรือค่าสี hex */
  accent: string
  setAccent: (a: string) => void
  dark: boolean
  toggle: () => void
  /** ชื่อเว็บ/ระบบ ที่แก้ไขได้ */
  siteName: string
  setSiteName: (n: string) => void
  /** โลโก้ (data URL) — ว่าง = ใช้ตัวอักษรแทน */
  logo: string
  setLogo: (v: string | undefined) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('kol-theme-mode') as ThemeMode) || 'system'
    } catch {
      return 'system'
    }
  })
  const [accent, setAccentState] = useState<string>(() => {
    try {
      return localStorage.getItem('kol-accent') || 'default'
    } catch {
      return 'default'
    }
  })
  const [dark, setDark] = useState<boolean>(() => mode === 'dark' || (mode === 'system' && systemDark()))
  const [siteName, setSiteNameState] = useState<string>(() => {
    try {
      return localStorage.getItem('kol-site-name') || DEFAULT_SITE_NAME
    } catch {
      return DEFAULT_SITE_NAME
    }
  })
  const [logo, setLogoState] = useState<string>(() => {
    try {
      return localStorage.getItem('kol-logo') || ''
    } catch {
      return ''
    }
  })

  // ใช้โหมดสว่าง/มืด
  useEffect(() => {
    const apply = () => {
      const d = mode === 'dark' || (mode === 'system' && systemDark())
      setDark(d)
      document.documentElement.classList.toggle('dark', d)
    }
    apply()
    try {
      localStorage.setItem('kol-theme-mode', mode)
    } catch {
      /* ignore */
    }
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [mode])

  // ใช้สี accent
  useEffect(() => {
    const root = document.documentElement
    try {
      localStorage.setItem('kol-accent', accent)
    } catch {
      /* ignore */
    }
    if (accent === 'default') {
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-soft')
      root.style.removeProperty('--accent-ink')
    } else {
      root.style.setProperty('--accent', accent)
      root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 16%, transparent)`)
      root.style.setProperty('--accent-ink', accent)
    }
  }, [accent])

  // ใช้ชื่อเว็บ (ชื่อแท็บเบราว์เซอร์ + จำค่า)
  useEffect(() => {
    const name = siteName.trim() || DEFAULT_SITE_NAME
    document.title = `${name} — ระบบติดตาม KOL`
    try {
      localStorage.setItem('kol-site-name', siteName)
    } catch {
      /* ignore */
    }
  }, [siteName])

  // จำค่าโลโก้
  useEffect(() => {
    try {
      if (logo) localStorage.setItem('kol-logo', logo)
      else localStorage.removeItem('kol-logo')
    } catch {
      /* ignore */
    }
  }, [logo])

  const value: ThemeContextValue = {
    mode,
    setMode: setModeState,
    accent,
    setAccent: setAccentState,
    dark,
    toggle: () => setModeState(dark ? 'light' : 'dark'),
    siteName,
    setSiteName: setSiteNameState,
    logo,
    setLogo: (v) => setLogoState(v ?? ''),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
