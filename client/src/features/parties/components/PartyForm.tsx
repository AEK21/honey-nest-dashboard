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
  quantity: string
  category: string
}

// Μπουφές Ενηλίκων — food items only (entry fee is auto-calculated)
const BUFFET_ITEMS = [
  { name: 'Pizza margarita', price: '12', unit: 'τεμ.' },
  { name: 'Mini Cheeseburgers', price: '30', unit: '10τμχ' },
  { name: 'Hot Dogs', price: '20', unit: '10τμχ' },
  { name: 'Στικ αγγούρι & ντομάτα', price: '15', unit: '10τμχ' },
  { name: 'Mozzarella sticks', price: '15', unit: '10τμχ' },
  { name: 'Mac & cheese sticks', price: '18', unit: '10τμχ' },
  { name: 'Chicken nuggets', price: '15', unit: '10τμχ' },
  { name: 'Τυροπιτάκια', price: '10', unit: '10τμχ' },
] as const

// Παιδικά Μενού
const KIDS_MENUS = [
  {
    price: '13' as const,
    items: ['Chicken nuggets με πατάτες', 'Pizza margarita', 'Στικ αγγούρι & ντομάτα', 'Απεριόριστος χυμός'],
  },
  {
    price: '14' as const,
    items: ['Mini cheeseburger με πατάτες', 'Pizza margarita', 'Στικ αγγούρι & ντομάτα', 'Απεριόριστος χυμός'],
  },
]

// Έξτρα Παροχές
const EXTRA_PAROXES = [
  { name: 'Πινιάτα', price: '50', note: null },
  { name: 'Messy Play', price: '100', note: '10 παιδιά' },
  { name: 'Movie Time', price: '60', note: '10 παιδιά' },
  { name: 'Disco Party', price: '50', note: null },
  { name: 'Εργαστήριο', price: '60', note: '10 παιδιά' },
  { name: 'Ανιματέρ', price: '300', note: '2 ώρες' },
  { name: 'Μάγος', price: '120', note: '1 ώρα' },
  { name: 'Έξτρα στολισμός', price: '300', note: null },
] as const

// Αποκλειστικότητα χώρου
const VENUE_OPTIONS = [
  { key: '60plus', label: '60+ καλεσμένοι', price: 100 },
  { key: '40to60', label: '40–60 καλεσμένοι', price: 200 },
  { key: '20to40', label: '20–40 καλεσμένοι', price: 250 },
  { key: 'under20', label: 'Κάτω από 20 καλεσμένοι', price: 300 },
] as const

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
  const [contactPhone, setContactPhone] = useState(party?.contactPhone ?? '')
  const [childName, setChildName] = useState(party?.childName ?? '')
  const [childAge, setChildAge] = useState(party?.childAge != null ? String(party.childAge) : '')
  const [kidsCount, setKidsCount] = useState(party?.kidsCount != null ? String(party.kidsCount) : '')
  const [adultsCount, setAdultsCount] = useState(party?.adultsCount != null ? String(party.adultsCount) : '')
  const [packageName, setPackageName] = useState(party?.packageName ?? 'basic')
  const [packagePrice, setPackagePrice] = useState(party?.packagePrice != null ? String(party.packagePrice) : '100')
  const [depositAmount, setDepositAmount] = useState(party?.depositAmount != null ? String(party.depositAmount) : '')
  const [status, setStatus] = useState<typeof statuses[number]>(party?.status ?? 'booked')
  const [eventType, setEventType] = useState(party?.eventType ?? '')
  const [notes, setNotes] = useState(party?.notes ?? '')
  const [tried, setTried] = useState(false)

  // Auto-calculated choices (stored as special addon categories in DB)
  const [kidsMenuChoice, setKidsMenuChoice] = useState<'' | '13' | '14'>(() => {
    const existing = party?.addons.find(a => a.category === 'kids_menu')
    return existing ? (String(Math.round(existing.addonPrice)) as '13' | '14') : ''
  })
  const [venueExclusivity, setVenueExclusivity] = useState<string>(() => {
    const existing = party?.addons.find(a => a.category === 'venue')
    return existing ? (VENUE_OPTIONS.find(v => v.price === existing.addonPrice)?.key ?? '') : ''
  })

  // Manual add-ons: buffet food + extras + custom
  // Auto-calculated (entry, kids_menu, venue) are excluded — computed at submit
  const [addons, setAddons] = useState<AddonRow[]>(() =>
    (party?.addons ?? [])
      .filter(a => a.category !== 'entry' && a.category !== 'kids_menu' && a.category !== 'venue')
      .map(a => ({
        key: ++addonKeyCounter,
        addonName: a.addonName,
        addonPrice: String(a.addonPrice),
        quantity: String(a.quantity ?? 1),
        category: a.category ?? '',
      }))
  )

  // ── Helpers ─────────────────────────────────────────────────

  const cleanDecimal = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return null
    if (parts[1] && parts[1].length > 2) return null
    return cleaned
  }

  const addAddon = () => {
    setAddons(prev => [...prev, { key: ++addonKeyCounter, addonName: '', addonPrice: '', quantity: '1', category: 'custom' }])
  }

  const toggleExtra = (preset: typeof EXTRA_PAROXES[number]) => {
    const already = addons.find(a => a.addonName === preset.name && a.category === 'extra')
    if (already) {
      setAddons(prev => prev.filter(a => a.key !== already.key))
    } else {
      setAddons(prev => [...prev, { key: ++addonKeyCounter, addonName: preset.name, addonPrice: preset.price, quantity: '1', category: 'extra' }])
    }
  }

  const getBuffetQty = (name: string) => {
    const row = addons.find(a => a.addonName === name && a.category === 'buffet')
    return row ? parseInt(row.quantity) || 0 : 0
  }

  const setBuffetQty = (item: typeof BUFFET_ITEMS[number], qty: number) => {
    if (qty <= 0) {
      setAddons(prev => prev.filter(a => !(a.addonName === item.name && a.category === 'buffet')))
    } else {
      setAddons(prev => {
        const existing = prev.find(a => a.addonName === item.name && a.category === 'buffet')
        if (existing) return prev.map(a => a.key === existing.key ? { ...a, quantity: String(qty) } : a)
        return [...prev, { key: ++addonKeyCounter, addonName: item.name, addonPrice: item.price, quantity: String(qty), category: 'buffet' }]
      })
    }
  }

  const removeAddon = (key: number) => setAddons(prev => prev.filter(a => a.key !== key))
  const updateAddon = (key: number, field: keyof AddonRow, value: string) =>
    setAddons(prev => prev.map(a => a.key === key ? { ...a, [field]: value } : a))

  // ── Live totals ──────────────────────────────────────────────

  const adultsNum = parseInt(adultsCount) || 0
  const kidsNum = parseInt(kidsCount) || 0
  const adultEntryTotal = adultsNum * 6
  const kidMenuTotal = kidsMenuChoice ? kidsNum * parseInt(kidsMenuChoice) : 0
  const venueOption = VENUE_OPTIONS.find(v => v.key === venueExclusivity)
  const venueTotal = venueOption?.price ?? 0
  const buffetTotal = addons
    .filter(a => a.category === 'buffet')
    .reduce((s, a) => s + (parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1), 0)
  const extrasTotal = addons
    .filter(a => a.category === 'extra')
    .reduce((s, a) => s + (parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1), 0)
  const customTotal = addons
    .filter(a => a.category !== 'buffet' && a.category !== 'extra')
    .reduce((s, a) => s + (parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1), 0)
  const addonsTotal = adultEntryTotal + kidMenuTotal + venueTotal + buffetTotal + extrasTotal + customTotal
  const packagePriceNum = parseFloat(packagePrice) || 0
  const grandTotal = packagePriceNum + addonsTotal

  // ── Validation ───────────────────────────────────────────────

  const phoneDigits = contactPhone.replace(/\D/g, '')
  const phoneValid = phoneDigits.length >= 8
  const canSave = customerName.trim() && phoneValid && packageName.trim() && packagePrice

  // ── Submit ───────────────────────────────────────────────────

  const handleSubmit = async () => {
    setTried(true)
    if (!canSave) return

    const autoAddons: PartyFormData['addons'] = []
    if (adultsNum > 0) {
      autoAddons.push({ addonName: 'Είσοδος ενηλίκου', addonPrice: 6, quantity: adultsNum, category: 'entry' })
    }
    if (kidsMenuChoice && kidsNum > 0) {
      autoAddons.push({ addonName: `Παιδικό Μενού ${kidsMenuChoice}€`, addonPrice: parseInt(kidsMenuChoice), quantity: kidsNum, category: 'kids_menu' })
    }
    if (venueOption) {
      autoAddons.push({ addonName: `Αποκλειστικότητα (${venueOption.label})`, addonPrice: venueOption.price, quantity: 1, category: 'venue' })
    }

    const manualAddons = addons
      .filter(a => a.addonName.trim() && a.addonPrice)
      .map(a => ({
        addonName: a.addonName.trim(),
        addonPrice: parseFloat(a.addonPrice) || 0,
        quantity: parseInt(a.quantity) || 1,
        category: a.category.trim() || null,
      }))

    const data: PartyFormData = {
      partyDate,
      partyTime: partyTime || null,
      customerName: customerName.trim(),
      contactPhone: contactPhone.trim() || null,
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
      addons: [...autoAddons, ...manualAddons],
    }

    await onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#252220] border-b border-[#3D3530] px-5 py-3 flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-semibold text-[#E8E0D4]">
          {party ? 'Edit Party' : 'New Party'}
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#7A6F63] hover:text-[#C4B8A8] hover:bg-[#3D3530]/50 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-[480px] mx-auto px-5 py-5 space-y-5 pb-36">

        {/* Status */}
        <div>
          <Label>Status</Label>
          <div className="flex gap-1.5 mt-1.5">
            {statuses.map(s => (
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
            <Input type="date" value={partyDate} onChange={e => setPartyDate(e.target.value)} />
          </div>
          <div className="w-[120px]">
            <Label>Time</Label>
            <Input type="time" value={partyTime} onChange={e => setPartyTime(e.target.value)} />
          </div>
        </div>

        {/* Customer + Phone */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Customer Name *</Label>
            <Input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Parent / booking contact"
              className={tried && !customerName.trim() ? 'border-[#D4564E]/70 focus:ring-[#D4564E]/25 focus:border-[#D4564E]/60' : ''}
            />
            {tried && !customerName.trim() && <p className="mt-1 text-[11px] text-[#D4564E]">Required</p>}
          </div>
          <div className="w-[160px]">
            <Label>Contact Phone *</Label>
            <Input
              type="tel"
              inputMode="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="694 xxx xxxx"
              className={tried && !phoneValid ? 'border-[#D4564E]/70 focus:ring-[#D4564E]/25 focus:border-[#D4564E]/60' : ''}
            />
            {tried && !phoneValid && (
              <p className="mt-1 text-[11px] text-[#D4564E]">{contactPhone.trim() ? 'Too short' : 'Required'}</p>
            )}
          </div>
        </div>

        {/* Child + Age */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Child Name</Label>
            <Input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Birthday child" />
          </div>
          <div className="w-[80px]">
            <Label>Age</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={childAge}
              onChange={e => setChildAge(e.target.value.replace(/\D/g, ''))}
              placeholder="—"
            />
          </div>
        </div>

        {/* Kids + Adults counts */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Kids</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={kidsCount}
              onChange={e => setKidsCount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <Label>Adults</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={adultsCount}
              onChange={e => setAdultsCount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
            />
          </div>
        </div>

        {/* Event type */}
        <div>
          <Label>Event Type</Label>
          <Input value={eventType} onChange={e => setEventType(e.target.value)} placeholder="birthday, baptism, workshop..." />
        </div>

        {/* Package */}
        <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide mb-3">Package</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Name *</Label>
              <Input
                value={packageName}
                onChange={e => setPackageName(e.target.value)}
                placeholder="Basic, Premium, Deluxe..."
                className={tried && !packageName.trim() ? 'border-[#D4564E]/70 focus:ring-[#D4564E]/25 focus:border-[#D4564E]/60' : ''}
              />
              {tried && !packageName.trim() && <p className="mt-1 text-[11px] text-[#D4564E]">Required</p>}
            </div>
            <div className="w-[120px]">
              <Label>Price *</Label>
              <EuroInput
                value={packagePrice}
                onChange={v => { const c = cleanDecimal(v); if (c !== null) setPackagePrice(c) }}
                error={tried && !packagePrice}
              />
              {tried && !packagePrice && <p className="mt-1 text-[11px] text-[#D4564E]">Required</p>}
            </div>
          </div>
        </div>

        {/* ══ ADD-ONS ══════════════════════════════════════════════ */}
        <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4 space-y-5">
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide">Add-ons</h3>

          {/* ── Παιδικά Μενού ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-[#9A8E82] uppercase tracking-wide">Παιδικά Μενού</p>
              {kidsMenuChoice && kidsNum > 0 && (
                <p className="text-[11px] text-[#E7C76A] tabular-nums">
                  {kidsNum} × €{kidsMenuChoice} = €{kidsNum * parseInt(kidsMenuChoice)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {KIDS_MENUS.map(menu => {
                const active = kidsMenuChoice === menu.price
                return (
                  <button
                    key={menu.price}
                    type="button"
                    onClick={() => setKidsMenuChoice(active ? '' : menu.price)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      active
                        ? 'bg-[#E7C76A]/10 border-[#E7C76A]/50'
                        : 'bg-[#1E1B18] border-[#3D3530] hover:border-[#5A5048]'
                    }`}
                  >
                    <p className={`text-[12px] font-semibold mb-2 ${active ? 'text-[#E7C76A]' : 'text-[#C4B8A8]'}`}>
                      Μενού €{menu.price}
                    </p>
                    <ul className="space-y-0.5">
                      {menu.items.map(item => (
                        <li key={item} className="text-[10px] text-[#5A5048] flex items-start gap-1">
                          <span className="mt-[2px] shrink-0 opacity-60">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
            {kidsMenuChoice && kidsNum === 0 && (
              <p className="mt-1.5 text-[10px] text-[#7A6F63]">
                Βάλε αριθμό παιδιών παραπάνω για αυτόματο υπολογισμό
              </p>
            )}
          </div>

          {/* ── Είσοδος ενηλίκου (auto from adultsCount) ── */}
          <div className={`rounded-lg border px-3 py-2.5 flex items-center justify-between transition-colors ${
            adultsNum > 0 ? 'bg-[#E7C76A]/05 border-[#E7C76A]/20' : 'bg-[#1E1B18] border-[#3D3530]/40'
          }`}>
            <div>
              <p className={`text-[12px] font-medium ${adultsNum > 0 ? 'text-[#C4B8A8]' : 'text-[#5A5048]'}`}>
                Είσοδος ενηλίκου
                <span className="ml-1.5 text-[10px] font-normal opacity-60">€6 / άτομο · αυτόματα</span>
              </p>
              {adultsNum > 0
                ? <p className="text-[10px] text-[#7A6F63] mt-0.5">{adultsNum} ενήλικες × €6</p>
                : <p className="text-[10px] text-[#3D3530] mt-0.5">Βάλε αριθμό ενηλίκων παραπάνω</p>
              }
            </div>
            <p className={`text-[14px] font-bold tabular-nums ${adultsNum > 0 ? 'text-[#E7C76A]' : 'text-[#3D3530]'}`}>
              €{adultEntryTotal}
            </p>
          </div>

          {/* ── Μπουφές Ενηλίκων ── */}
          <div className="rounded-lg bg-[#1E1B18] border border-[#3D3530]/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#3D3530]/60 flex items-center justify-between">
              <p className="text-[12px] font-semibold text-[#C4B8A8]">Μπουφές Ενηλίκων</p>
              {buffetTotal > 0 && (
                <p className="text-[11px] text-[#E7C76A] tabular-nums">€{buffetTotal.toFixed(2)}</p>
              )}
            </div>
            <div className="divide-y divide-[#3D3530]/40">
              {BUFFET_ITEMS.map(item => {
                const qty = getBuffetQty(item.name)
                return (
                  <div key={item.name} className="flex items-center gap-3 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#E8E0D4] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#5A5048]">{item.unit} · €{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {qty > 0 && (
                        <span className="text-[11px] text-[#9A8E82] tabular-nums mr-1">
                          €{(parseFloat(item.price) * qty).toFixed(0)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setBuffetQty(item, qty - 1)}
                        disabled={qty === 0}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[14px] font-bold transition-colors ${
                          qty > 0 ? 'bg-[#3D3530] text-[#C4B8A8] hover:bg-[#4A4039]' : 'bg-[#2A2520] text-[#3D3530] cursor-default'
                        }`}
                      >−</button>
                      <span className={`w-6 text-center text-[12px] font-semibold tabular-nums ${qty > 0 ? 'text-[#E7C76A]' : 'text-[#3D3530]'}`}>
                        {qty > 0 ? qty : '·'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBuffetQty(item, qty + 1)}
                        className="w-6 h-6 rounded-md bg-[#3D3530] text-[#C4B8A8] flex items-center justify-center text-[14px] font-bold hover:bg-[#4A4039] transition-colors"
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Έξτρα Παροχές ── */}
          <div>
            <p className="text-[11px] font-semibold text-[#9A8E82] uppercase tracking-wide mb-2">Έξτρα Παροχές</p>
            <div className="grid grid-cols-2 gap-2">
              {EXTRA_PAROXES.map(preset => {
                const active = addons.some(a => a.addonName === preset.name && a.category === 'extra')
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => toggleExtra(preset)}
                    className={`rounded-lg border px-3 py-2.5 text-left flex items-start justify-between gap-2 transition-all ${
                      active
                        ? 'bg-[#E7C76A]/10 border-[#E7C76A]/50'
                        : 'bg-[#1E1B18] border-[#3D3530] hover:border-[#5A5048]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-[12px] font-medium leading-tight ${active ? 'text-[#E7C76A]' : 'text-[#C4B8A8]'}`}>
                        {preset.name}
                      </p>
                      {preset.note && (
                        <p className="text-[10px] text-[#5A5048] mt-0.5">{preset.note}</p>
                      )}
                    </div>
                    <p className={`text-[12px] font-semibold tabular-nums shrink-0 ${active ? 'text-[#E7C76A]' : 'text-[#7A6F63]'}`}>
                      €{preset.price}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Αποκλειστικότητα χώρου ── */}
          <div>
            <p className="text-[11px] font-semibold text-[#9A8E82] uppercase tracking-wide mb-2">Αποκλειστικότητα χώρου</p>
            <div className="space-y-1.5">
              {VENUE_OPTIONS.map(opt => {
                const active = venueExclusivity === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setVenueExclusivity(active ? '' : opt.key)}
                    className={`w-full rounded-lg border px-3 py-2 flex items-center justify-between transition-all ${
                      active
                        ? 'bg-[#E7C76A]/10 border-[#E7C76A]/50'
                        : 'bg-[#1E1B18] border-[#3D3530] hover:border-[#5A5048]'
                    }`}
                  >
                    <p className={`text-[12px] ${active ? 'text-[#E7C76A]' : 'text-[#C4B8A8]'}`}>{opt.label}</p>
                    <p className={`text-[12px] font-semibold tabular-nums ${active ? 'text-[#E7C76A]' : 'text-[#7A6F63]'}`}>
                      €{opt.price}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Custom add-on rows ── */}
          {addons.filter(a => a.category !== 'buffet' && a.category !== 'extra').length > 0 && (
            <div className="space-y-2">
              {addons
                .filter(a => a.category !== 'buffet' && a.category !== 'extra')
                .map(addon => (
                  <div key={addon.key} className="rounded-lg bg-[#1E1B18] border border-[#3D3530]/50 p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          value={addon.addonName}
                          onChange={e => updateAddon(addon.key, 'addonName', e.target.value)}
                          placeholder="Όνομα add-on..."
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
                      <div className="w-[100px]">
                        <EuroInput
                          value={addon.addonPrice}
                          onChange={v => { const c = cleanDecimal(v); if (c !== null) updateAddon(addon.key, 'addonPrice', c) }}
                        />
                      </div>
                      <div className="w-[70px]">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={addon.quantity}
                          onChange={e => updateAddon(addon.key, 'quantity', e.target.value.replace(/\D/g, '') || '1')}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <button
            type="button"
            onClick={addAddon}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#7A6F63] hover:text-[#C4B8A8] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom add-on
          </button>

          {/* ── Add-ons total breakdown ── */}
          {addonsTotal > 0 && (
            <div className="border-t border-[#3D3530] pt-3 space-y-1.5">
              {/* Είσοδος ενηλίκου */}
              {adultEntryTotal > 0 && (
                <div className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>Είσοδος ενηλίκου ({adultsNum} άτομα × €6)</span>
                  <span className="tabular-nums">€{adultEntryTotal}</span>
                </div>
              )}
              {/* Παιδικό μενού */}
              {kidMenuTotal > 0 && (
                <div className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>Παιδικό Μενού €{kidsMenuChoice} ({kidsNum} παιδιά)</span>
                  <span className="tabular-nums">€{kidMenuTotal}</span>
                </div>
              )}
              {/* Κάθε buffet item ξεχωριστά */}
              {addons.filter(a => a.category === 'buffet').map(a => (
                <div key={a.key} className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>{a.addonName}{parseInt(a.quantity) > 1 ? ` ×${a.quantity}` : ''}</span>
                  <span className="tabular-nums">€{((parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1)).toFixed(2)}</span>
                </div>
              ))}
              {/* Κάθε extra παροχή ξεχωριστά */}
              {addons.filter(a => a.category === 'extra').map(a => (
                <div key={a.key} className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>{a.addonName}{parseInt(a.quantity) > 1 ? ` ×${a.quantity}` : ''}</span>
                  <span className="tabular-nums">€{((parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1)).toFixed(2)}</span>
                </div>
              ))}
              {/* Αποκλειστικότητα */}
              {venueTotal > 0 && (
                <div className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>Αποκλειστικότητα ({venueOption?.label})</span>
                  <span className="tabular-nums">€{venueTotal}</span>
                </div>
              )}
              {/* Custom add-ons */}
              {addons.filter(a => a.category !== 'buffet' && a.category !== 'extra').filter(a => a.addonName.trim() && a.addonPrice).map(a => (
                <div key={a.key} className="flex justify-between text-[11px] text-[#7A6F63]">
                  <span>{a.addonName}{parseInt(a.quantity) > 1 ? ` ×${a.quantity}` : ''}</span>
                  <span className="tabular-nums">€{((parseFloat(a.addonPrice) || 0) * (parseInt(a.quantity) || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-[12px] font-semibold text-[#C4B8A8] pt-1.5 border-t border-[#3D3530]/60">
                <span>Σύνολο add-ons</span>
                <span className="tabular-nums text-[#E7C76A]">€{addonsTotal.toFixed(2)}</span>
              </div>
              {packagePriceNum > 0 && (
                <div className="flex justify-between text-[13px] font-bold text-[#E8E0D4] pt-0.5">
                  <span>Γενικό σύνολο</span>
                  <span className="tabular-nums">€{grandTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deposit */}
        <div className="w-[160px]">
          <Label>Deposit Paid</Label>
          <EuroInput value={depositAmount} onChange={v => { const c = cleanDecimal(v); if (c !== null) setDepositAmount(c) }} />
        </div>

        {/* Notes */}
        <div>
          <Label>Notes</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Allergies, special requests..."
            rows={2}
            className="w-full rounded-lg border border-[#4A4039] bg-[#1E1B18] px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-[60px] left-0 right-0 bg-[#252220]/95 backdrop-blur-sm border-t border-[#3D3530] px-5 py-3 z-40">
        <div className="max-w-[480px] mx-auto flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] rounded-xl border border-[#3D3530] text-[#9A8E82] text-sm font-medium hover:bg-[#3D3530]/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`flex-[2] h-[44px] rounded-xl text-sm font-bold tracking-wide transition-all shadow-[0_0_16px_rgba(231,199,106,0.2)] disabled:cursor-not-allowed ${
              canSave
                ? 'bg-[#E7C76A] text-[#1C1917] hover:bg-[#EDD07E] disabled:opacity-50'
                : 'bg-[#E7C76A]/40 text-[#1C1917]/60'
            }`}
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

// ── Reusable primitives ─────────────────────────────────────────

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

function EuroInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const handleBlur = () => {
    if (!value) return
    const num = parseFloat(value)
    if (!isNaN(num)) onChange(num.toFixed(2))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7A6F63] pointer-events-none">€</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="0.00"
        className={`w-full h-9 rounded-lg border bg-[#1E1B18] pl-7 pr-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 transition-colors tabular-nums ${
          error
            ? 'border-[#D4564E]/70 focus:ring-[#D4564E]/25 focus:border-[#D4564E]/60'
            : 'border-[#4A4039] focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40'
        }`}
      />
    </div>
  )
}
