import { format, parseISO } from 'date-fns'
import { Pencil, Trash2, Users, Baby } from 'lucide-react'
import type { Party } from '../hooks/useParties'

interface PartyCardProps {
  party: Party
  onEdit: () => void
  onDelete: () => void
}

const statusConfig = {
  inquiry: { label: 'Inquiry', color: 'bg-[#9A8E82]/20 text-[#9A8E82]' },
  booked: { label: 'Booked', color: 'bg-[#E7C76A]/20 text-[#E7C76A]' },
  completed: { label: 'Completed', color: 'bg-[#6ECF8E]/20 text-[#6ECF8E]' },
  cancelled: { label: 'Cancelled', color: 'bg-[#D4564E]/20 text-[#D4564E]' },
} as const

export function PartyCard({ party, onEdit, onDelete }: PartyCardProps) {
  const st = statusConfig[party.status]
  const dateLabel = format(parseISO(party.partyDate), 'EEE, MMM d')
  const balance =
    party.depositAmount != null
      ? party.totalRevenue - party.depositAmount
      : null

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="text-[14px] font-semibold text-[#E8E0D4]">
            {party.customerName}
          </p>
          <p className="text-[12px] text-[#7A6F63] mt-0.5">
            {dateLabel}
            {party.partyTime && ` \u00B7 ${party.partyTime}`}
            {party.eventType && ` \u00B7 ${party.eventType}`}
          </p>
        </div>
        <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full ${st.color}`}>
          {st.label}
        </span>
      </div>

      {(party.childName || party.kidsCount != null) && (
        <div className="flex items-center gap-3 mb-2.5 text-[12px] text-[#9A8E82]">
          {party.childName && (
            <span className="flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" />
              {party.childName}
              {party.childAge != null && `, ${party.childAge}y`}
            </span>
          )}
          {party.kidsCount != null && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {party.kidsCount} kids
              {party.adultsCount != null && ` + ${party.adultsCount} adults`}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#3D3530] pt-2.5">
        <div className="text-[12px] text-[#9A8E82]">
          <span className="text-[#C4B8A8] font-medium">{party.packageName}</span>
          {' \u00B7 '}
          {'\u20AC'}{party.packagePrice.toFixed(2)}
          {party.addons.length > 0 && (
            <span> + {party.addons.length} add-on{party.addons.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <p className="text-[15px] font-semibold text-[#E8E0D4] tabular-nums">
          {'\u20AC'}{party.totalRevenue.toFixed(2)}
        </p>
      </div>

      {balance != null && balance > 0 && (
        <p className="text-[11px] text-[#E7C76A] mt-1.5 text-right">
          {'\u20AC'}{party.depositAmount!.toFixed(2)} deposit \u00B7 {'\u20AC'}{balance.toFixed(2)} remaining
        </p>
      )}

      <div className="flex justify-end gap-1 mt-2.5">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-[#7A6F63] hover:text-[#C4B8A8] hover:bg-[#3D3530]/50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[#7A6F63] hover:text-[#D4564E] hover:bg-[#D4564E]/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
