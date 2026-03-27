import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDashboard } from './hooks/useDashboard'
import { useChartData } from './hooks/useChartData'
import { KpiCard } from './components/KpiCard'
import { BusinessAreaFilter } from './components/BusinessAreaFilter'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart'
import { KidsTrendChart } from './components/KidsTrendChart'
import { ProfitBreakdown } from './components/ProfitBreakdown'

export function DashboardPage() {
  const {
    area, setArea, month, monthDate, isCurrentMonth,
    goToPrevMonth, goToNextMonth, goToCurrentMonth,
    summary, isLoading,
  } = useDashboard()
  const { trend, categories, kids } = useChartData(month, area)
  const monthLabel = format(monthDate, 'MMMM yyyy')

  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-24">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[26px] font-semibold text-[#E8E0D4] tracking-tight">
            Dashboard
          </h1>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="text-[11px] font-medium tracking-wide text-[#E7C76A] bg-[#E7C76A]/15 px-2.5 py-1 rounded-full hover:bg-[#E7C76A]/25 transition-colors"
            >
              This month
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={goToPrevMonth}
            className="text-[#7A6F63] hover:text-[#C4B8A8] transition-colors p-0.5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-[13px] text-[#9A8E82] font-medium min-w-[120px] text-center">
            {monthLabel}
          </p>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            className="text-[#7A6F63] hover:text-[#C4B8A8] transition-colors p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
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
