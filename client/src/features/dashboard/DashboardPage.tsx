import { format } from 'date-fns'
import { useDashboard } from './hooks/useDashboard'
import { useChartData } from './hooks/useChartData'
import { KpiCard } from './components/KpiCard'
import { BusinessAreaFilter } from './components/BusinessAreaFilter'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart'
import { KidsTrendChart } from './components/KidsTrendChart'
import { ProfitBreakdown } from './components/ProfitBreakdown'

export function DashboardPage() {
  const { area, setArea, month, summary, isLoading } = useDashboard()
  const { trend, categories, kids } = useChartData(month, area)
  const monthLabel = format(new Date(), 'MMMM yyyy')

  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-semibold text-[#E8E0D4] tracking-tight">
          Dashboard
        </h1>
        <p className="text-[13px] text-[#7A6F63] mt-0.5">{monthLabel}</p>
      </div>

      <div className="mb-5">
        <BusinessAreaFilter value={area} onChange={setArea} />
      </div>

      <div
        className={`space-y-5 transition-opacity duration-150 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="flex flex-wrap gap-3">
          <KpiCard
            label="Today"
            value={summary?.todayRevenue ?? 0}
            delta={null}
          />
          <KpiCard
            label="MTD Revenue"
            value={summary?.mtdRevenue ?? 0}
            delta={summary?.revenueDelta ?? null}
          />
          <KpiCard
            label="Gross Profit"
            value={summary?.mtdProfit ?? 0}
            delta={summary?.profitDelta ?? null}
            badge={summary?.profitBasis ?? null}
          />
        </div>

        <RevenueTrendChart
          currentMonth={trend?.currentMonth ?? []}
          previousMonth={trend?.previousMonth ?? []}
        />

        <CategoryBreakdownChart
          categories={categories?.categories ?? []}
        />

        <ProfitBreakdown
          categories={categories?.categories ?? []}
        />

        <KidsTrendChart entries={kids?.entries ?? []} />
      </div>
    </div>
  )
}
