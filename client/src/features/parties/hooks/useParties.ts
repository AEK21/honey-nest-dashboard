import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'

export interface PartyAddon {
  id?: number
  addonName: string
  addonPrice: number
  category: string | null
}

export interface Party {
  id: number
  partyDate: string
  partyTime: string | null
  customerName: string
  childName: string | null
  childAge: number | null
  kidsCount: number | null
  adultsCount: number | null
  packageName: string
  packagePrice: number
  depositAmount: number | null
  status: 'inquiry' | 'booked' | 'completed' | 'cancelled'
  eventType: string | null
  notes: string | null
  addons: PartyAddon[]
  addonsTotal: number
  totalRevenue: number
}

export interface PartyFormData {
  partyDate: string
  partyTime: string | null
  customerName: string
  childName: string | null
  childAge: number | null
  kidsCount: number | null
  adultsCount: number | null
  packageName: string
  packagePrice: number
  depositAmount: number | null
  status: 'inquiry' | 'booked' | 'completed' | 'cancelled'
  eventType: string | null
  notes: string | null
  addons: { addonName: string; addonPrice: number; category: string | null }[]
}

export function useParties() {
  const [monthDate, setMonthDate] = useState(new Date())
  const month = format(monthDate, 'yyyy-MM')
  const isCurrentMonth = isSameMonth(monthDate, new Date())
  const queryClient = useQueryClient()

  const goToPrevMonth = useCallback(() => setMonthDate((d) => subMonths(d, 1)), [])
  const goToNextMonth = useCallback(() => setMonthDate((d) => addMonths(d, 1)), [])
  const goToCurrentMonth = useCallback(() => setMonthDate(new Date()), [])

  const query = useQuery<{ parties: Party[] }>({
    queryKey: ['parties', month],
    queryFn: () =>
      fetch(`/api/parties?month=${month}`).then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (data: PartyFormData) =>
      fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parties', month] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartyFormData }) =>
      fetch(`/api/parties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parties', month] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/parties/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parties', month] }),
  })

  return {
    month,
    monthDate,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    parties: query.data?.parties ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: (id: number, data: PartyFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  }
}
