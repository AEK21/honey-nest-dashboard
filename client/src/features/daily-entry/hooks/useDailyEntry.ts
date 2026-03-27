import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback, useRef } from 'react'
import { format, addDays, subDays } from 'date-fns'

export interface EntryRow {
  categoryId: number
  categoryName: string
  displayName: string
  businessArea: string
  revenue: number | null
  costAmount: number | null
  costBasis: string
  costMarginPct: number | null
}

interface DailyEntryResponse {
  date: string
  entries: EntryRow[]
  kidsCount: number | null
  lastSaved: string | null
}

interface SavePayload {
  date: string
  entries: Array<{
    categoryId: number
    revenue: number
    costAmount?: number | null
    costBasis?: 'exact' | 'estimated'
  }>
  kidsCount?: number | null
}

export interface CostState {
  costValue: string
  costBasis: 'exact' | 'estimated'
}

export function useDailyEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const queryClient = useQueryClient()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Form state
  const [revenues, setRevenues] = useState<Record<number, string>>({})
  const [kidsCount, setKidsCount] = useState('')
  const [costs, setCosts] = useState<Record<number, CostState>>({})

  // Snapshot for dirty tracking
  const snapshotRef = useRef('')

  const query = useQuery<DailyEntryResponse>({
    queryKey: ['daily-entries', dateStr],
    queryFn: () =>
      fetch(`/api/daily-entries?date=${dateStr}`).then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (payload: SavePayload) =>
      fetch('/api/daily-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-entries', dateStr] })
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (!query.data) return
    const revMap: Record<number, string> = {}
    const costMap: Record<number, CostState> = {}
    for (const entry of query.data.entries) {
      revMap[entry.categoryId] =
        entry.revenue != null ? String(entry.revenue) : ''
      costMap[entry.categoryId] = {
        costValue: entry.costAmount != null ? String(entry.costAmount) : '',
        costBasis: (entry.costBasis === 'exact' ? 'exact' : 'estimated') as
          | 'exact'
          | 'estimated',
      }
    }
    setRevenues(revMap)
    setKidsCount(query.data.kidsCount != null ? String(query.data.kidsCount) : '')
    setCosts(costMap)
    snapshotRef.current = JSON.stringify({ revMap, kidsCount: query.data.kidsCount != null ? String(query.data.kidsCount) : '', costMap })
  }, [query.data])

  // Dirty check
  const currentSnapshot = JSON.stringify({ revMap: revenues, kidsCount, costMap: costs })
  const isDirty = snapshotRef.current !== '' && currentSnapshot !== snapshotRef.current

  // Navigation with dirty guard
  const tryNavigate = useCallback(
    (target: Date) => {
      if (isDirty) {
        setPendingDate(target)
      } else {
        setSelectedDate(target)
      }
    },
    [isDirty]
  )

  const goToPrevDay = () => tryNavigate(subDays(selectedDate, 1))
  const goToNextDay = () => tryNavigate(addDays(selectedDate, 1))
  const goToToday = () => tryNavigate(new Date())

  const confirmDiscard = () => {
    if (pendingDate) {
      setSelectedDate(pendingDate)
      setPendingDate(null)
    }
  }

  const confirmSave = async (buildPayload: () => SavePayload) => {
    try {
      await mutation.mutateAsync(buildPayload())
      if (pendingDate) {
        setSelectedDate(pendingDate)
        setPendingDate(null)
      }
    } catch {
      // Save failed — stay on current date, dialog remains open
    }
  }

  const cancelNavigation = () => setPendingDate(null)

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

  return {
    selectedDate,
    setSelectedDate: tryNavigate,
    dateStr,
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
    goToPrevDay,
    goToNextDay,
    goToToday,
    isToday,
    // Form state
    revenues,
    setRevenues,
    kidsCount,
    setKidsCount,
    costs,
    setCosts,
    // Dirty / navigation
    isDirty,
    pendingDate,
    confirmDiscard,
    confirmSave,
    cancelNavigation,
  }
}
