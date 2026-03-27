import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useDashboard } from './hooks/useDashboard'
import { useChartData } from './hooks/useChartData'
import { KpiCard } from './components/KpiCard'
import { BusinessAreaFilter } from './components/BusinessAreaFilter'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart'
import { KidsTrendChart } from './components/KidsTrendChart'
import { ProfitBreakdown } from './components/ProfitBreakdown'
import { PartyRevenueSummary } from './components/PartyRevenueSummary'
import { usePartyDashboard } from './hooks/usePartyDashboard'

export function DashboardPage() {
  const {
    area, setArea, month, monthDate, isCurrentMonth,
    goToPrevMonth, goToNextMonth, goToCurrentMonth,
    summary, isLoading,
  } = useDashboard()
  const { trend, categories, kids } = useChartData(month, area)
  const partyDash = usePartyDashboard(month)
  const showPartyWidget = area === 'all' || area === 'parties'
  usePageTitle('Dashboard')
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
          <button
            onClick={() => window.open(`/api/export/entries?month=${month}`, '_blank')}
            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-[#7A6F63] hover:text-[#C4B8A8] transition-colors"
          >
            <Download className="w-3 h-3" />
            Export CSV
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

        {!isLoading && summary && summary.todayRevenue === 0 && summary.mtdRevenue === 0 && summary.mtdProfit === 0 && (
          <p className="text-[12px] text-[#7A6F63] text-center">
            {area === 'parties'
              ? 'No completed parties yet this month'
              : 'No data yet \u2014 enter today\u2019s numbers to get started'}
          </p>
        )}

        <RevenueTrendChart
          currentMonth={trend?.currentMonth ?? []}
          previousMonth={trend?.previousMonth ?? []}
        />

        {showPartyWidget && partyDash.data && (
          <PartyRevenueSummary
            partyCount={partyDash.data.partyCount}
            packageRevenue={partyDash.data.packageRevenue}
            addonRevenue={partyDash.data.addonRevenue}
            totalRevenue={partyDash.data.totalRevenue}
            avgPerParty={partyDash.data.avgPerParty}
          />
        )}

        {area !== 'parties' && (
          <>
            <CategoryBreakdownChart
              categories={categories?.categories ?? []}
            />

            <ProfitBreakdown
              categories={categories?.categories ?? []}
            />

            <KidsTrendChart entries={kids?.entries ?? []} />
          </>
        )}
      </div>
    </div>
  )
}
