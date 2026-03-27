import { useQuery } from '@tanstack/react-query'
import type { AreaFilter } from './useDashboard'

interface TrendPoint {
  day: number
  date: string
  revenue: number
}

interface TrendResponse {
  currentMonth: TrendPoint[]
  previousMonth: TrendPoint[]
}

interface CategoryRow {
  categoryId: number
  categoryName: string
  displayName: string
  businessArea: string
  revenue: number
  cost: number
  profit: number
  costBasis: 'exact' | 'estimated'
}

interface CategoriesResponse {
  categories: CategoryRow[]
}

interface KidsEntry {
  date: string
  count: number
}

interface KidsResponse {
  entries: KidsEntry[]
}

export function useChartData(month: string, area: AreaFilter) {
  const trend = useQuery<TrendResponse>({
    queryKey: ['dashboard-trend', month, area],
    queryFn: () =>
      fetch(`/api/dashboard/trend?month=${month}&area=${area}`).then((r) =>
        r.json()
      ),
  })

  const categories = useQuery<CategoriesResponse>({
    queryKey: ['dashboard-categories', month, area],
    queryFn: () =>
      fetch(`/api/dashboard/categories?month=${month}&area=${area}`).then((r) =>
        r.json()
      ),
  })

  const kids = useQuery<KidsResponse>({
    queryKey: ['dashboard-kids'],
    queryFn: () =>
      fetch('/api/dashboard/kids?days=30').then((r) => r.json()),
  })

  return {
    trend: trend.data,
    categories: categories.data,
    kids: kids.data,
    isLoading: trend.isLoading || categories.isLoading,
  }
}
