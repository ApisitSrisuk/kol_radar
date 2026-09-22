import { useCallback, useEffect, useState } from 'react'
import * as repo from '../lib/repo'
import type { Campaign, CampaignInput } from '../types'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCampaigns(await repo.fetchCampaigns())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCampaign = useCallback(async (input: CampaignInput) => {
    await repo.addCampaign(input)
    await refresh()
  }, [refresh])

  const updateCampaign = useCallback(
    async (id: string, input: CampaignInput) => {
      await repo.updateCampaign(id, input)
      await refresh()
    },
    [refresh]
  )

  const removeCampaign = useCallback(async (id: string) => {
    await repo.removeCampaign(id)
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    campaigns,
    loading,
    error,
    refresh,
    addCampaign,
    updateCampaign,
    removeCampaign,
  }
}
