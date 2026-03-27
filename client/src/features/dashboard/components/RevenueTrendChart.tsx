import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface TrendPoint {
  day: number
  date: string
  revenue: number
}

interface RevenueTrendChartProps {
  currentMonth: TrendPoint[]
  previousMonth: TrendPoint[]
}

export function RevenueTrendChart({
  currentMonth,
  previousMonth,
}: RevenueTrendChartProps) {
  // Merge both series by day-of-month for Recharts
  const maxDay = Math.max(
    currentMonth.length ? Math.max(...currentMonth.map((p) => p.day)) : 0,
    previousMonth.length ? Math.max(...previousMonth.map((p) => p.day)) : 0
  )

  const currentMap = new Map(currentMonth.map((p) => [p.day, p.revenue]))
  const prevMap = new Map(previousMonth.map((p) => [p.day, p.revenue]))

  const data = Array.from({ length: maxDay }, (_, i) => {
    const day = i + 1
    return {
      day,
      current: currentMap.get(day) ?? null,
      previous: prevMap.get(day) ?? null,
    }
  })

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
          Revenue Trend
        </h2>
        <p className="text-[13px] text-[#7A6F63] text-center py-10">
          No entries yet for this month
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
        Revenue Trend
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E7C76A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E7C76A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3D3530"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#7A6F63' }}
            axisLine={{ stroke: '#3D3530' }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#7A6F63' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `\u20AC${v}`}
          />
          <Tooltip content={<TrendTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="plainline"
            formatter={(value: string) => (
              <span className="text-[11px] text-[#9A8E82]">{value}</span>
            )}
          />
          <Area
            name="This month"
            type="monotone"
            dataKey="current"
            stroke="#E7C76A"
            strokeWidth={2}
            fill="url(#gradCurrent)"
            dot={false}
            connectNulls
          />
          <Area
            name="Last month"
            type="monotone"
            dataKey="previous"
            stroke="#7A6F63"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="transparent"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[#2A2622] border border-[#3D3530] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[#9A8E82] mb-1">Day {label}</p>
      {payload.map((entry: any) => (
        entry.value != null && (
          <p key={entry.name} className="text-[12px] font-medium" style={{ color: entry.stroke }}>
            {entry.name}: {'\u20AC'}{Number(entry.value).toFixed(2)}
          </p>
        )
      ))}
    </div>
  )
}
