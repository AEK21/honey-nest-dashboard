import type { AreaFilter } from '../hooks/useDashboard'

interface BusinessAreaFilterProps {
  value: AreaFilter
  onChange: (area: AreaFilter) => void
}

const options: { value: AreaFilter; label: string; disabled?: boolean }[] = [
  { value: 'all', label: 'All' },
  { value: 'retail', label: 'Retail' },
  { value: 'playroom_cafe', label: 'Playroom & Caf\u00e9' },
  { value: 'parties', label: 'Parties' },
]

export function BusinessAreaFilter({ value, onChange }: BusinessAreaFilterProps) {
  return (
    <div className="flex gap-1.5 rounded-full bg-[#1E1B18] border border-[#3D3530] p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => !opt.disabled && onChange(opt.value)}
          disabled={opt.disabled}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
            value === opt.value
              ? 'bg-[#3D3530] text-[#E8E0D4] shadow-sm'
              : opt.disabled
                ? 'text-[#4A4039] cursor-not-allowed'
                : 'text-[#7A6F63] hover:text-[#C4B8A8]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
