import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  delta: number | null
  badge?: string | null
}

export function KpiCard({ label, value, prefix = '\u20AC', delta, badge }: KpiCardProps) {
  const formattedValue = value.toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="flex-1 min-w-[140px] rounded-xl bg-[#252220] border border-[#3D3530] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <p className="text-[12px] font-medium text-[#9A8E82] tracking-wide uppercase mb-2">
        {label}
      </p>
      <p className="text-[20px] font-semibold text-[#E8E0D4] tracking-tight leading-none mb-2 truncate">
        <span className="text-[14px] font-normal text-[#7A6F63] mr-0.5">{prefix}</span>
        {formattedValue}
      </p>
      <div className="flex items-center gap-2">
        {delta !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${
              delta >= 0 ? 'text-[#6ECF8E]' : 'text-[#D4564E]'
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        {badge && (
          <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[#3D3530] text-[#9A8E82]">
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
