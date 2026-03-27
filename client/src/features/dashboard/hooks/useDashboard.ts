import { useQuery } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'

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
  const [monthDate, setMonthDate] = useState(new Date())
  const month = format(monthDate, 'yyyy-MM')
  const isCurrentMonth = isSameMonth(monthDate, new Date())

  const goToPrevMonth = useCallback(() => setMonthDate((d) => subMonths(d, 1)), [])
  const goToNextMonth = useCallback(() => setMonthDate((d) => addMonths(d, 1)), [])
  const goToCurrentMonth = useCallback(() => setMonthDate(new Date()), [])

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
    monthDate,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    summary: summary.data,
    isLoading: summary.isLoading,
  }
}
