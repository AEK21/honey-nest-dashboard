import { Cake } from 'lucide-react'

interface PartyRevenueSummaryProps {
  partyCount: number
  packageRevenue: number
  addonRevenue: number
  totalRevenue: number
  avgPerParty: number
}

export function PartyRevenueSummary({
  partyCount,
  packageRevenue,
  addonRevenue,
  totalRevenue,
  avgPerParty,
}: PartyRevenueSummaryProps) {
  if (partyCount === 0) {
    return (
      <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cake className="w-4 h-4 text-[#E7C76A]" />
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide">
            Parties
          </h3>
        </div>
        <p className="text-[13px] text-[#7A6F63]">
          No completed parties this month
        </p>
      </div>
    )
  }

  const packagePct = totalRevenue > 0 ? (packageRevenue / totalRevenue) * 100 : 0
  const addonPct = totalRevenue > 0 ? (addonRevenue / totalRevenue) * 100 : 0

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cake className="w-4 h-4 text-[#E7C76A]" />
          <h3 className="text-[13px] font-medium text-[#C4B8A8] uppercase tracking-wide">
            Parties
          </h3>
        </div>
        <span className="text-[11px] text-[#7A6F63]">
          {partyCount} completed
        </span>
      </div>

      {/* Revenue bar */}
      <div className="mb-3">
        <div className="flex h-2 rounded-full overflow-hidden bg-[#1E1B18]">
          <div
            className="bg-[#E7C76A] transition-all"
            style={{ width: `${packagePct}%` }}
          />
          <div
            className="bg-[#BFD8D2] transition-all"
            style={{ width: `${addonPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px]">
          <span className="text-[#E7C76A]">
            Packages {'\u20AC'}{packageRevenue.toFixed(0)}
          </span>
          <span className="text-[#BFD8D2]">
            Add-ons {'\u20AC'}{addonRevenue.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="flex items-baseline justify-between border-t border-[#3D3530] pt-2.5">
        <p className="text-[20px] font-semibold text-[#E8E0D4] tabular-nums">
          {'\u20AC'}{totalRevenue.toFixed(2)}
        </p>
        <p className="text-[12px] text-[#9A8E82]">
          {'\u20AC'}{avgPerParty.toFixed(0)} avg/party
        </p>
      </div>
    </div>
  )
}
