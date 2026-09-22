import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('kol-theme')
      if (s) return s === 'dark'
    } catch {
      /* ignore */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('kol-theme', dark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [dark])
  return { dark, toggle: () => setDark((d) => !d) }
}
