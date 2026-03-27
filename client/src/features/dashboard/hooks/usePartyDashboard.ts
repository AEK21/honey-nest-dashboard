import { useQuery } from '@tanstack/react-query'

interface PartyDashboardData {
  partyCount: number
  packageRevenue: number
  addonRevenue: number
  totalRevenue: number
  avgPerParty: number
}

export function usePartyDashboard(month: string) {
  return useQuery<PartyDashboardData>({
    queryKey: ['dashboard-parties', month],
    queryFn: () =>
      fetch(`/api/dashboard/parties?month=${month}`).then((r) => r.json()),
  })
}
