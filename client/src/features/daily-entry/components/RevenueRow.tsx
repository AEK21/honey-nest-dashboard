interface RevenueRowProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}

export function RevenueRow({ label, value, onChange, hint }: RevenueRowProps) {
  const handleChange = (raw: string) => {
    // Allow empty, digits, and one decimal with up to 2 places
    const cleaned = raw.replace(/[^0-9.]/g, '')
    // Prevent multiple dots
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return
    onChange(cleaned)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1">
        <span className="text-[13px] font-medium text-[#C4B8A8] tracking-wide">
          {label}
        </span>
        {hint && (
          <span className="ml-2 text-[11px] text-[#7A6F63]">{hint}</span>
        )}
      </div>
      <div className="relative w-[128px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7A6F63] pointer-events-none">
          &euro;
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'\u2014'}
          className="w-full h-10 rounded-lg border border-[#4A4039] bg-[#1E1B18] pl-7 pr-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors"
        />
      </div>
    </div>
  )
}
