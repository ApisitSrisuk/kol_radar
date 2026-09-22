import { useCallback, useEffect, useState } from 'react'
import * as repo from '../lib/repo'
import type { Kol, KolInput } from '../types'

export function useKols() {
  const [kols, setKols] = useState<Kol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setKols(await repo.fetchKols())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addKol = useCallback(async (input: KolInput) => {
    const kol = await repo.addKol(input)
    setKols((prev) => [kol, ...prev])
    return kol
  }, [])

  const updateKol = useCallback(async (id: string, input: KolInput) => {
    const kol = await repo.updateKol(id, input)
    setKols((prev) => prev.map((k) => (k.id === id ? kol : k)))
    return kol
  }, [])

  const removeKol = useCallback(async (id: string) => {
    await repo.removeKol(id)
    setKols((prev) => prev.filter((k) => k.id !== id))
  }, [])

  return { kols, loading, error, refresh, addKol, updateKol, removeKol }
}
