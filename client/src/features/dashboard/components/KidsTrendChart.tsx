import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface KidsEntry {
  date: string
  count: number
}

interface KidsTrendChartProps {
  entries: KidsEntry[]
}

export function KidsTrendChart({ entries }: KidsTrendChartProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
          Kids Entries
        </h2>
        <p className="text-[13px] text-[#7A6F63] text-center py-8">
          No kids entries in the last 30 days
        </p>
      </div>
    )
  }

  const data = entries.map((e) => ({
    ...e,
    label: format(parseISO(e.date), 'MMM d'),
  }))

  return (
    <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <h2 className="font-serif text-[17px] font-semibold text-[#C4B8A8] tracking-tight mb-4">
        Kids Entries
        <span className="text-[12px] font-normal text-[#7A6F63] ml-2">
          Last 30 days
        </span>
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradKids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BFD8D2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#BFD8D2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3D3530"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#7A6F63' }}
            axisLine={{ stroke: '#3D3530' }}
            tickLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#7A6F63' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<KidsTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#BFD8D2"
            strokeWidth={2}
            fill="url(#gradKids)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function KidsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg bg-[#2A2622] border border-[#3D3530] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[#9A8E82] mb-0.5">{data.label}</p>
      <p className="text-[12px] font-medium text-[#BFD8D2]">
        {data.count} kids
      </p>
    </div>
  )
}
