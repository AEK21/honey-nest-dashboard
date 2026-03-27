interface CategoryRow {
  categoryId: number
  displayName: string
  businessArea: string
  revenue: number
  cost: number
  profit: number
  costBasis: 'exact' | 'estimated'
}

interface ProfitBreakdownProps {
  categories: CategoryRow[]
}

export function ProfitBreakdown({ categories }: ProfitBreakdownProps) {
  const rows = categories
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.profit - a.profit)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
          Profit Detail
        </h2>
        <p className="text-[13px] text-[#7A6F63] text-center py-8">
          No data for this period
        </p>
      </div>
    )
  }

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalCost = rows.reduce((s, r) => s + r.cost, 0)
  const totalProfit = totalRevenue - totalCost

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
        Profit Detail
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-[#9A8E82]">
              <th className="text-left pb-2 font-medium">Category</th>
              <th className="text-right pb-2 font-medium">Revenue</th>
              <th className="text-right pb-2 font-medium">Cost</th>
              <th className="text-right pb-2 font-medium">Profit</th>
              <th className="text-center pb-2 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.categoryId}
                className={i % 2 === 0 ? 'bg-[#1E1B18]/50' : ''}
              >
                <td className="py-1.5 px-1 text-[#C4B8A8]">
                  {row.displayName}
                </td>
                <td className="py-1.5 px-1 text-right text-[#E8E0D4] tabular-nums">
                  {'\u20AC'}{row.revenue.toFixed(2)}
                </td>
                <td className="py-1.5 px-1 text-right text-[#9A8E82] tabular-nums">
                  {'\u20AC'}{row.cost.toFixed(2)}
                </td>
                <td className="py-1.5 px-1 text-right text-[#E8E0D4] font-medium tabular-nums">
                  {'\u20AC'}{row.profit.toFixed(2)}
                </td>
                <td className="py-1.5 text-center">
                  <span
                    className={`inline-block w-[6px] h-[6px] rounded-full ${
                      row.costBasis === 'exact'
                        ? 'bg-[#6ECF8E]'
                        : 'bg-[#E7C76A]'
                    }`}
                    title={row.costBasis === 'exact' ? 'Exact cost' : 'Estimated cost'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#3D3530]">
              <td className="pt-2 px-1 text-[#9A8E82] font-medium">Total</td>
              <td className="pt-2 px-1 text-right text-[#E8E0D4] font-medium tabular-nums">
                {'\u20AC'}{totalRevenue.toFixed(2)}
              </td>
              <td className="pt-2 px-1 text-right text-[#9A8E82] font-medium tabular-nums">
                {'\u20AC'}{totalCost.toFixed(2)}
              </td>
              <td className="pt-2 px-1 text-right text-[#E8E0D4] font-semibold tabular-nums">
                {'\u20AC'}{totalProfit.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-[#7A6F63]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#6ECF8E]" />
            Exact
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#E7C76A]" />
            Estimated
          </span>
        </div>
      </div>
    </div>
  )
}
