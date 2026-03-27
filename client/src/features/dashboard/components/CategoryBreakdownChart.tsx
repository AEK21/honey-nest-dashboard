import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'

interface CategoryRow {
  categoryId: number
  displayName: string
  businessArea: string
  revenue: number
  profit: number
}

interface CategoryBreakdownChartProps {
  categories: CategoryRow[]
}

const areaColors: Record<string, string> = {
  retail: '#E7C76A',
  playroom_cafe: '#BFD8D2',
  parties: '#EBC1B3',
}

export function CategoryBreakdownChart({
  categories,
}: CategoryBreakdownChartProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
          By Category
        </h2>
        <p className="text-[13px] text-[#7A6F63] text-center py-10">
          Enter some data to see breakdowns
        </p>
      </div>
    )
  }

  const data = categories
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  const chartHeight = Math.max(data.length * 44, 160)

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
        By Category
      </h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#7A6F63' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `\u20AC${v}`}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            tick={{ fontSize: 11, fill: '#C4B8A8' }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: '#3D3530', opacity: 0.3 }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={22}>
            {data.map((entry) => (
              <Cell
                key={entry.categoryId}
                fill={areaColors[entry.businessArea] ?? '#7A6F63'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CategoryTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg bg-[#2A2622] border border-[#3D3530] px-3 py-2 shadow-lg">
      <p className="text-[12px] font-medium text-[#E8E0D4] mb-1">
        {data.displayName}
      </p>
      <p className="text-[11px] text-[#9A8E82]">
        Revenue: {'\u20AC'}{Number(data.revenue).toFixed(2)}
      </p>
      <p className="text-[11px] text-[#9A8E82]">
        Profit: {'\u20AC'}{Number(data.profit).toFixed(2)}
      </p>
    </div>
  )
}
