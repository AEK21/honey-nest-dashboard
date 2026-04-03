import type { TameioState } from '../hooks/useTameio'

interface TameioSectionProps {
  form: TameioState
  onChange: (field: keyof TameioState, value: string) => void
  synolo: number
}

export function TameioSection({ form, onChange, synolo }: TameioSectionProps) {
  const n = (v: string) => parseFloat(v) || 0
  const balance = synolo - n(form.cashSeKing)

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#3D3530]">
        <h2 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide">
          Ταμείο
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Cash / Card / A — 3 children */}
        <div className="grid grid-cols-3 gap-2">
          <TameioField
            label="Cash"
            value={form.cash}
            onChange={v => onChange('cash', v)}
            accentColor="#6ECF8E"
          />
          <TameioField
            label="Card"
            value={form.card}
            onChange={v => onChange('card', v)}
            accentColor="#7EB8D4"
          />
          <TameioField
            label="A"
            value={form.aValue}
            onChange={v => onChange('aValue', v)}
            accentColor="#C4A87E"
          />
        </div>

        {/* Subtotal Cash + Card + A */}
        {(n(form.cash) + n(form.card) + n(form.aValue)) > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-[#5A5048]">Cash + Card + A</span>
            <span className="text-[13px] font-semibold text-[#C4B8A8] tabular-nums">
              €{(n(form.cash) + n(form.card) + n(form.aValue)).toFixed(2)}
            </span>
          </div>
        )}

        <div className="h-px bg-[#3D3530]" />

        {/* Last Day Cash — auto-filled, editable override */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#9A8E82] uppercase tracking-wide">
              Last Day Cash
            </span>
            <span className="text-[10px] text-[#5A5048]">αυτόματα από χθες</span>
          </div>
          <TameioField
            label=""
            value={form.lastDayCash}
            onChange={v => onChange('lastDayCash', v)}
            accentColor="#E7C76A"
            noLabel
          />
        </div>

        {/* Exoda apo tameio */}
        <div>
          <div className="mb-1.5">
            <span className="text-[11px] font-medium text-[#9A8E82] uppercase tracking-wide">
              Έξοδα από ταμείο
            </span>
          </div>
          <TameioField
            label=""
            value={form.exoda}
            onChange={v => onChange('exoda', v)}
            accentColor="#D4564E"
            noLabel
          />
        </div>

        <div className="h-px bg-[#3D3530]" />

        {/* Synolo — read-only computed */}
        <div className="rounded-lg bg-[#1E1B18] border border-[#3D3530]/60 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#9A8E82] uppercase tracking-wide">Σύνολο</p>
            <p className="text-[10px] text-[#5A5048] mt-0.5">Cash + A + Last Day − Έξοδα</p>
          </div>
          <p className={`text-[20px] font-bold tabular-nums ${synolo < 0 ? 'text-[#D4564E]' : 'text-[#E8E0D4]'}`}>
            €{synolo.toFixed(2)}
          </p>
        </div>

        {/* Cash se King */}
        <div>
          <div className="mb-1.5">
            <span className="text-[11px] font-medium text-[#9A8E82] uppercase tracking-wide">
              Cash σε King
            </span>
          </div>
          <TameioField
            label=""
            value={form.cashSeKing}
            onChange={v => onChange('cashSeKing', v)}
            accentColor="#E7C76A"
            noLabel
          />
        </div>

        {/* Balance hint: what stays in register after King */}
        {(n(form.cashSeKing) > 0 || synolo > 0) && (
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#5A5048]">Υπόλοιπο ταμείου</span>
            <span className={`font-semibold tabular-nums ${balance < 0 ? 'text-[#D4564E]' : 'text-[#9A8E82]'}`}>
              €{balance.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Field primitive ──────────────────────────────────────────────

interface TameioFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  accentColor: string
  noLabel?: boolean
}

function TameioField({ label, value, onChange, accentColor, noLabel }: TameioFieldProps) {
  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    onChange(cleaned)
  }

  const handleBlur = () => {
    if (!value) return
    const num = parseFloat(value)
    if (!isNaN(num)) onChange(num.toFixed(2))
  }

  return (
    <div>
      {!noLabel && (
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentColor }}>
          {label}
        </p>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7A6F63] pointer-events-none">€</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="0.00"
          style={{ colorScheme: 'dark' }}
          className="w-full h-10 rounded-lg border border-[#4A4039] bg-[#1E1B18] pl-7 pr-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#3D3530] focus:outline-none focus:ring-2 transition-colors tabular-nums"
          onFocus={e => (e.target.style.borderColor = accentColor + '60')}
          onBlurCapture={e => (e.target.style.borderColor = '')}
        />
      </div>
    </div>
  )
}
