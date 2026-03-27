import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { format } from 'date-fns'

export type AreaFilter = 'all' | 'retail' | 'playroom_cafe'

interface SummaryResponse {
  todayRevenue: number
  mtdRevenue: number
  mtdProfit: number
  profitBasis: 'exact' | 'estimated'
  prevMonthRevenue: number
  prevMonthProfit: number
  revenueDelta: number | null
  profitDelta: number | null
}

export function useDashboard() {
  const [area, setArea] = useState<AreaFilter>('all')
  const month = format(new Date(), 'yyyy-MM')

  const summary = useQuery<SummaryResponse>({
    queryKey: ['dashboard-summary', month, area],
    queryFn: () =>
      fetch(`/api/dashboard/summary?month=${month}&area=${area}`).then((r) =>
        r.json()
      ),
  })

  return {
    area,
    setArea,
    month,
    summary: summary.data,
    isLoading: summary.isLoading,
  }
}
