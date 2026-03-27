import type { ReactNode } from 'react'

interface RevenueSectionProps {
  title: string
  accentColor: string
  children: ReactNode
}

export function RevenueSection({
  title,
  accentColor,
  children,
}: RevenueSectionProps) {
  return (
    <div
      className="bg-[#252220] rounded-xl border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <h2
        className="font-serif text-[19px] font-semibold mb-5 tracking-tight"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
