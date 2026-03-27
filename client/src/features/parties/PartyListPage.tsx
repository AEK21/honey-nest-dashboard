import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useParties } from './hooks/useParties'
import type { Party, PartyFormData } from './hooks/useParties'
import { PartyCard } from './components/PartyCard'
import { PartyForm } from './components/PartyForm'

export function PartyListPage() {
  const {
    monthDate, isCurrentMonth,
    goToPrevMonth, goToNextMonth, goToCurrentMonth,
    parties, isLoading,
    create, update, remove, isSaving,
  } = useParties()

  const [formOpen, setFormOpen] = useState(false)
  const [editingParty, setEditingParty] = useState<Party | null>(null)

  const monthLabel = format(monthDate, 'MMMM yyyy')

  // Group parties by date
  const grouped = new Map<string, Party[]>()
  for (const p of parties) {
    const list = grouped.get(p.partyDate) ?? []
    list.push(p)
    grouped.set(p.partyDate, list)
  }
  const sortedDates = [...grouped.keys()].sort()

  const handleSave = async (data: PartyFormData) => {
    try {
      if (editingParty) {
        await update(editingParty.id, data)
        toast.success('Party updated')
      } else {
        await create(data)
        toast.success('Party created')
      }
      setFormOpen(false)
      setEditingParty(null)
    } catch {
      toast.error("Couldn't save \u2014 check your connection")
    }
  }

  const handleEdit = (party: Party) => {
    setEditingParty(party)
    setFormOpen(true)
  }

  const handleDelete = async (party: Party) => {
    if (!confirm(`Delete ${party.customerName}'s party?`)) return
    try {
      await remove(party.id)
      toast.success('Party deleted')
    } catch {
      toast.error("Couldn't delete")
    }
  }

  const handleNew = () => {
    setEditingParty(null)
    setFormOpen(true)
  }

  if (formOpen) {
    return (
      <PartyForm
        party={editingParty}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditingParty(null) }}
        isSaving={isSaving}
      />
    )
  }

  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[26px] font-semibold text-[#E8E0D4] tracking-tight">
            Parties
          </h1>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="text-[11px] font-medium tracking-wide text-[#E7C76A] bg-[#E7C76A]/15 px-2.5 py-1 rounded-full hover:bg-[#E7C76A]/25 transition-colors"
            >
              This month
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={goToPrevMonth}
            className="text-[#7A6F63] hover:text-[#C4B8A8] transition-colors p-0.5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-[13px] text-[#9A8E82] font-medium min-w-[120px] text-center">
            {monthLabel}
          </p>
          <button
            onClick={goToNextMonth}
            className="text-[#7A6F63] hover:text-[#C4B8A8] transition-colors p-0.5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Party list */}
      <div
        className={`space-y-5 transition-opacity duration-150 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {sortedDates.length === 0 && !isLoading && (
          <p className="text-[13px] text-[#7A6F63] text-center py-16">
            No parties this month
          </p>
        )}

        {sortedDates.map((date) => {
          const dayParties = grouped.get(date)!
          const dateLabel = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')
          return (
            <div key={date}>
              <p className="text-[11px] font-medium text-[#7A6F63] uppercase tracking-wide mb-2">
                {dateLabel}
              </p>
              <div className="space-y-3">
                {dayParties.map((party) => (
                  <PartyCard
                    key={party.id}
                    party={party}
                    onEdit={() => handleEdit(party)}
                    onDelete={() => handleDelete(party)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={handleNew}
        className="fixed bottom-20 right-5 w-12 h-12 rounded-full bg-[#E7C76A] text-[#1C1917] shadow-[0_4px_20px_rgba(231,199,106,0.4)] hover:bg-[#EDD07E] transition-all flex items-center justify-center"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}
