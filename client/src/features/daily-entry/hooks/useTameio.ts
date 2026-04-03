import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export interface TameioData {
  entryDate: string
  cash: number
  card: number
  aValue: number
  lastDayCash: number
  exoda: number
  cashSeKing: number
  synolo: number
  saved?: boolean
}

export interface TameioState {
  cash: string
  card: string
  aValue: string
  lastDayCash: string
  exoda: string
  cashSeKing: string
}

const empty: TameioState = { cash: '', card: '', aValue: '', lastDayCash: '', exoda: '', cashSeKing: '' }

export function useTameio(dateStr: string) {
  const queryClient = useQueryClient()

  const query = useQuery<TameioData>({
    queryKey: ['tameio', dateStr],
    queryFn: () => fetch(`/api/tameio?date=${dateStr}`).then(r => r.json()),
  })

  const [form, setForm] = useState<TameioState>(empty)
  const [initialForm, setInitialForm] = useState<TameioState>(empty)

  // Sync form when data loads for this date
  useEffect(() => {
    if (!query.data) return
    const d = query.data
    const loaded: TameioState = {
      cash: d.cash > 0 ? String(d.cash) : '',
      card: d.card > 0 ? String(d.card) : '',
      aValue: d.aValue > 0 ? String(d.aValue) : '',
      lastDayCash: d.lastDayCash > 0 ? String(d.lastDayCash) : '',
      exoda: d.exoda > 0 ? String(d.exoda) : '',
      cashSeKing: d.cashSeKing > 0 ? String(d.cashSeKing) : '',
    }
    setForm(loaded)
    setInitialForm(loaded)
  }, [query.data])

  const mutation = useMutation({
    mutationFn: (payload: TameioState) =>
      fetch('/api/tameio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          cash: parseFloat(payload.cash) || 0,
          card: parseFloat(payload.card) || 0,
          aValue: parseFloat(payload.aValue) || 0,
          lastDayCash: parseFloat(payload.lastDayCash) || 0,
          exoda: parseFloat(payload.exoda) || 0,
          cashSeKing: parseFloat(payload.cashSeKing) || 0,
        }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tameio', dateStr] })
      setInitialForm(form)
    },
  })

  // Computed values (live, not from server)
  const n = (v: string) => parseFloat(v) || 0
  const synolo = n(form.cash) + n(form.aValue) + n(form.lastDayCash) - n(form.exoda)
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)
  const hasAnyValue = Object.values(form).some(v => v !== '')

  return {
    form,
    setForm,
    synolo,
    isDirty,
    hasAnyValue,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    save: () => mutation.mutateAsync(form),
  }
}
