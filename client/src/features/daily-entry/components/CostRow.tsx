interface CostRowProps {
  label: string
  costValue: string
  onCostChange: (value: string) => void
  costBasis: 'exact' | 'estimated'
  onCostBasisChange: (basis: 'exact' | 'estimated') => void
  marginHint: string | null
}

export function CostRow({
  label,
  costValue,
  onCostChange,
  costBasis,
  onCostBasisChange,
  marginHint,
}: CostRowProps) {
  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    onCostChange(cleaned)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#C4B8A8] flex-1 tracking-wide">
          {label}
        </span>
        <div className="relative w-[108px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7A6F63] pointer-events-none">
            &euro;
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={costValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={'\u2014'}
            className="w-full h-9 rounded-lg border border-[#4A4039] bg-[#1E1B18] pl-7 pr-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors"
          />
        </div>
        <div className="flex rounded-full bg-[#1E1B18] border border-[#3D3530] p-0.5">
          <button
            type="button"
            onClick={() => onCostBasisChange('exact')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              costBasis === 'exact'
                ? 'bg-[#3D3530] text-[#E8E0D4] shadow-sm'
                : 'text-[#7A6F63] hover:text-[#C4B8A8]'
            }`}
          >
            Exact
          </button>
          <button
            type="button"
            onClick={() => onCostBasisChange('estimated')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              costBasis === 'estimated'
                ? 'bg-[#3D3530] text-[#E8E0D4] shadow-sm'
                : 'text-[#7A6F63] hover:text-[#C4B8A8]'
            }`}
          >
            Est.
          </button>
        </div>
      </div>
      {marginHint && (
        <p className="text-[11px] text-[#7A6F63] text-right pr-1">
          {marginHint}
        </p>
      )}
    </div>
  )
}
