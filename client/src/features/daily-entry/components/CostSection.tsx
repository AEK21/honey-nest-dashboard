import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CostRow } from './CostRow'

export interface CostEntry {
  categoryId: number
  displayName: string
  costValue: string
  costBasis: 'exact' | 'estimated'
  costMarginPct: number | null
  revenue: number | null
}

interface CostSectionProps {
  categories: CostEntry[]
  onCostChange: (categoryId: number, value: string) => void
  onCostBasisChange: (categoryId: number, basis: 'exact' | 'estimated') => void
}

export function CostSection({
  categories,
  onCostChange,
  onCostBasisChange,
}: CostSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#3D3530] px-4 py-4 text-sm font-medium text-[#7A6F63] hover:text-[#C4B8A8] hover:border-[#4A4039] transition-colors cursor-pointer"
      >
        Add costs
        <ChevronDown className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="bg-[#252220] rounded-xl border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-[19px] font-semibold text-[#C4B8A8] tracking-tight">
          Costs
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[#7A6F63] hover:text-[#C4B8A8] transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const marginHint =
            cat.revenue != null &&
            cat.revenue > 0 &&
            cat.costValue === '' &&
            cat.costMarginPct != null
              ? `Est. from margin: \u20AC${(cat.revenue * cat.costMarginPct).toFixed(2)}`
              : null

          return (
            <CostRow
              key={cat.categoryId}
              label={cat.displayName}
              costValue={cat.costValue}
              onCostChange={(v) => onCostChange(cat.categoryId, v)}
              costBasis={cat.costBasis}
              onCostBasisChange={(b) => onCostBasisChange(cat.categoryId, b)}
              marginHint={marginHint}
            />
          )
        })}
      </div>
    </div>
  )
}
