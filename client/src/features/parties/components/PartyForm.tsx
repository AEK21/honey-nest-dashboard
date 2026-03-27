import { useState } from 'react'
import { format } from 'date-fns'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Party, PartyFormData } from '../hooks/useParties'

interface PartyFormProps {
  party?: Party | null
  onSave: (data: PartyFormData) => Promise<unknown>
  onClose: () => void
  isSaving: boolean
}

interface AddonRow {
  key: number
  addonName: string
  addonPrice: string
  category: string
}

const statuses = ['inquiry', 'booked', 'completed', 'cancelled'] as const
const statusLabels: Record<string, string> = {
  inquiry: 'Inquiry',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

let addonKeyCounter = 0

export function PartyForm({ party, onSave, onClose, isSaving }: PartyFormProps) {
  const [partyDate, setPartyDate] = useState(party?.partyDate ?? format(new Date(), 'yyyy-MM-dd'))
  const [partyTime, setPartyTime] = useState(party?.partyTime ?? '')
  const [customerName, setCustomerName] = useState(party?.customerName ?? '')
  const [childName, setChildName] = useState(party?.childName ?? '')
  const [childAge, setChildAge] = useState(party?.childAge != null ? String(party.childAge) : '')
  const [kidsCount, setKidsCount] = useState(party?.kidsCount != null ? String(party.kidsCount) : '')
  const [adultsCount, setAdultsCount] = useState(party?.adultsCount != null ? String(party.adultsCount) : '')
  const [packageName, setPackageName] = useState(party?.packageName ?? '')
  const [packagePrice, setPackagePrice] = useState(party?.packagePrice != null ? String(party.packagePrice) : '')
  const [depositAmount, setDepositAmount] = useState(party?.depositAmount != null ? String(party.depositAmount) : '')
  const [status, setStatus] = useState<typeof statuses[number]>(party?.status ?? 'booked')
  const [eventType, setEventType] = useState(party?.eventType ?? '')
  const [notes, setNotes] = useState(party?.notes ?? '')
  const [addons, setAddons] = useState<AddonRow[]>(
    party?.addons.map((a) => ({
      key: ++addonKeyCounter,
      addonName: a.addonName,
      addonPrice: String(a.addonPrice),
      category: a.category ?? '',
    })) ?? []
  )

  const addAddon = () => {
    setAddons((prev) => [...prev, { key: ++addonKeyCounter, addonName: '', addonPrice: '', category: '' }])
  }

  const removeAddon = (key: number) => {
    setAddons((prev) => prev.filter((a) => a.key !== key))
  }

  const updateAddon = (key: number, field: keyof AddonRow, value: string) => {
    setAddons((prev) =>
      prev.map((a) => (a.key === key ? { ...a, [field]: value } : a))
    )
  }

  const cleanDecimal = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return null
    if (parts[1] && parts[1].length > 2) return null
    return cleaned
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !packageName.trim() || !packagePrice) return

    const data: PartyFormData = {
      partyDate,
      partyTime: partyTime || null,
      customerName: customerName.trim(),
      childName: childName.trim() || null,
      childAge: childAge ? parseInt(childAge, 10) : null,
      kidsCount: kidsCount ? parseInt(kidsCount, 10) : null,
      adultsCount: adultsCount ? parseInt(adultsCount, 10) : null,
      packageName: packageName.trim(),
      packagePrice: parseFloat(packagePrice) || 0,
      depositAmount: depositAmount ? parseFloat(depositAmount) : null,
      status,
      eventType: eventType.trim() || null,
      notes: notes.trim() || null,
      addons: addons
        .filter((a) => a.addonName.trim() && a.addonPrice)
        .map((a) => ({
          addonName: a.addonName.trim(),
          addonPrice: parseFloat(a.addonPrice) || 0,
          category: a.category.trim() || null,
        })),
    }

    await onSave(data)
  }

  const canSave = customerName.trim() && packageName.trim() && packagePrice

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#252220] border-b border-[#3D3530] px-5 py-3 flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-semibold text-[#E8E0D4]">
          {party ? 'Edit Party' : 'New Party'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#7A6F63] hover:text-[#C4B8A8] hover:bg-[#3D3530]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-[480px] mx-auto px-5 py-5 space-y-5 pb-28">
        {/* Status pills */}
        <div>
          <Label>Status</Label>
          <div className="flex gap-1.5 mt-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  status === s
                    ? 'bg-[#3D3530] text-[#E8E0D4] shadow-sm'
                    : 'text-[#7A6F63] hover:text-[#C4B8A8] bg-[#1E1B18] border border-[#3D3530]'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Date + Time */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Date *</Label>
            <Input type="date" value={partyDate} onChange={(e) => setPartyDate(e.target.value)} />
          </div>
          <div className="w-[120px]">
            <Label>Time</Label>
            <Input type="time" value={partyTime} onChange={(e) => setPartyTime(e.target.value)} />
          </div>
        </div>

        {/* Customer */}
        <div>
          <Label>Customer Name *</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Parent / booking contact"
          />
        </div>

        {/* Child + Age */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Child Name</Label>
            <Input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Birthday child"
            />
          </div>
          <div className="w-[80px]">
            <Label>Age</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value.replace(/\D/g, ''))}
              placeholder="—"
            />
          </div>
        </div>

        {/* Counts */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Kids</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={kidsCount}
              onChange={(e) => setKidsCount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <Label>Adults</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={adultsCount}
              onChange={(e) => setAdultsCount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Event type */}
        <div>
          <Label>Event Type</Label>
          <Input
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="birthday, baptism, workshop..."
          />
        </div>

        {/* Package */}
        <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide mb-3">
            Package
          </h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Name *</Label>
              <Input
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="Basic, Premium, Deluxe..."
              />
            </div>
            <div className="w-[120px]">
              <Label>Price *</Label>
              <EuroInput value={packagePrice} onChange={(v) => { const c = cleanDecimal(v); if (c !== null) setPackagePrice(c) }} />
            </div>
          </div>
        </div>

        {/* Add-ons */}
        <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide mb-3">
            Add-ons
          </h3>
          <div className="space-y-3">
            {addons.map((addon) => (
              <div key={addon.key} className="rounded-lg bg-[#1E1B18] border border-[#3D3530]/50 p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      value={addon.addonName}
                      onChange={(e) => updateAddon(addon.key, 'addonName', e.target.value)}
                      placeholder="Pizza tray, balloons..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddon(addon.key)}
                    className="p-1.5 rounded-md text-[#7A6F63] hover:text-[#D4564E] hover:bg-[#D4564E]/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="w-[110px]">
                    <EuroInput
                      value={addon.addonPrice}
                      onChange={(v) => { const c = cleanDecimal(v); if (c !== null) updateAddon(addon.key, 'addonPrice', c) }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={addon.category}
                      onChange={(e) => updateAddon(addon.key, 'category', e.target.value)}
                      placeholder="Type (food, decor...)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAddon}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#7A6F63] hover:text-[#C4B8A8] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add add-on
          </button>
        </div>

        {/* Deposit */}
        <div className="w-[160px]">
          <Label>Deposit Paid</Label>
          <EuroInput value={depositAmount} onChange={(v) => { const c = cleanDecimal(v); if (c !== null) setDepositAmount(c) }} />
        </div>

        {/* Notes */}
        <div>
          <Label>Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, special requests..."
            rows={2}
            className="w-full rounded-lg border border-[#4A4039] bg-[#1E1B18] px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#252220]/95 backdrop-blur-sm border-t border-[#3D3530] px-5 py-3">
        <div className="max-w-[480px] mx-auto flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] rounded-xl border border-[#3D3530] text-[#9A8E82] text-sm font-medium hover:bg-[#3D3530]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave || isSaving}
            className="flex-[2] h-[44px] rounded-xl bg-[#E7C76A] text-[#1C1917] text-sm font-bold tracking-wide hover:bg-[#EDD07E] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(231,199,106,0.2)]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : party ? (
              'Update Party'
            ) : (
              'Save Party'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Small reusable bits ─────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-[#9A8E82] uppercase tracking-wide mb-1">
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ colorScheme: 'dark', ...props.style }}
      className={`w-full h-9 rounded-lg border border-[#4A4039] bg-[#1E1B18] px-3 text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors ${props.className ?? ''}`}
    />
  )
}

function EuroInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handleBlur = () => {
    if (!value) return
    const num = parseFloat(value)
    if (!isNaN(num)) onChange(num.toFixed(2))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7A6F63] pointer-events-none">
        {'\u20AC'}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="0.00"
        className="w-full h-9 rounded-lg border border-[#4A4039] bg-[#1E1B18] pl-7 pr-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors tabular-nums"
      />
    </div>
  )
}
