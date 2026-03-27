import { Users } from 'lucide-react'

interface KidsCountRowProps {
  value: string
  onChange: (value: string) => void
}

export function KidsCountRow({ value, onChange }: KidsCountRowProps) {
  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '')
    onChange(cleaned)
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#3D3530]">
      <div className="flex items-center justify-between gap-4 py-1">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[#C4B8A8] flex-1 tracking-wide">
          <Users className="w-4 h-4 text-[#7A6F63]" />
          Kids today
        </span>
        <div className="relative w-[88px]">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={'\u2014'}
            className="w-full h-10 rounded-lg border border-[#4A4039] bg-[#1E1B18] px-3 text-right text-sm text-[#E8E0D4] placeholder:text-[#5A5048] focus:outline-none focus:ring-2 focus:ring-[#E7C76A]/25 focus:border-[#E7C76A]/40 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
