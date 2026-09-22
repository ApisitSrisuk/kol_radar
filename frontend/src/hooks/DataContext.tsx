import { createContext, useContext, type ReactNode } from 'react'
import { useKols } from './useKols'
import { useCampaigns } from './useCampaigns'

type DataValue = ReturnType<typeof useKols> & {
  campaigns: ReturnType<typeof useCampaigns>['campaigns']
  campaignsLoading: boolean
  addCampaign: ReturnType<typeof useCampaigns>['addCampaign']
  updateCampaign: ReturnType<typeof useCampaigns>['updateCampaign']
  removeCampaign: ReturnType<typeof useCampaigns>['removeCampaign']
  refreshAll: () => Promise<void>
}

const DataContext = createContext<DataValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const kolsApi = useKols()
  const campApi = useCampaigns()

  const value: DataValue = {
    ...kolsApi,
    campaigns: campApi.campaigns,
    campaignsLoading: campApi.loading,
    addCampaign: campApi.addCampaign,
    updateCampaign: campApi.updateCampaign,
    removeCampaign: campApi.removeCampaign,
    refreshAll: async () => {
      await Promise.all([kolsApi.refresh(), campApi.refresh()])
    },
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
