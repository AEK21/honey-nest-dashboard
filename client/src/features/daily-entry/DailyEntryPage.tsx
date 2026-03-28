import { format } from 'date-fns'
import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useDailyEntry } from './hooks/useDailyEntry'
import type { CostState } from './hooks/useDailyEntry'
import { DateNavBar } from './components/DateNavBar'
import { RevenueSection } from './components/RevenueSection'
import { RevenueRow } from './components/RevenueRow'
import { KidsCountRow } from './components/KidsCountRow'
import { CostSection } from './components/CostSection'
import type { CostEntry } from './components/CostSection'
import { SaveButton } from './components/SaveButton'
import { UnsavedChangesDialog } from './components/UnsavedChangesDialog'

const ENTRY_FEE_PER_KID = 7

export function DailyEntryPage() {
  const {
    selectedDate,
    setSelectedDate,
    dateStr,
    data,
    isLoading,
    save,
    isSaving,
    goToPrevDay,
    goToNextDay,
    goToToday,
    isToday,
    revenues,
    setRevenues,
    kidsCount,
    setKidsCount,
    costs,
    setCosts,
    isDirty,
    pendingDate,
    confirmDiscard,
    confirmSave,
    cancelNavigation,
  } = useDailyEntry()

  usePageTitle('Entry')

  // Track whether the user has manually overridden entry fees
  const [entryFeeOverride, setEntryFeeOverride] = useState(false)
  const prevDateRef = useRef(dateStr)
  if (prevDateRef.current !== dateStr) {
    prevDateRef.current = dateStr
    setEntryFeeOverride(false)
  }

  // Find entry_fees category id
  const entryFeeCategoryId = data?.entries.find(
    (e) => e.categoryName === 'entry_fees'
  )?.categoryId

  const handleKidsCountChange = useCallback(
    (value: string) => {
      setKidsCount(value)
      if (!entryFeeOverride && entryFeeCategoryId != null) {
        const kids = parseInt(value, 10)
        const autoRevenue = !isNaN(kids) && kids > 0 ? String(kids * ENTRY_FEE_PER_KID) : ''
        setRevenues((prev: Record<number, string>) => ({
          ...prev,
          [entryFeeCategoryId]: autoRevenue,
        }))
      }
    },
    [entryFeeOverride, entryFeeCategoryId, setKidsCount, setRevenues]
  )

  // Group entries by businessArea (skip parties — Phase 4)
  const retailEntries =
    data?.entries.filter((e) => e.businessArea === 'retail') ?? []
  const playroomEntries =
    data?.entries.filter((e) => e.businessArea === 'playroom_cafe') ?? []
  const allNonPartyEntries =
    data?.entries.filter((e) => e.businessArea !== 'parties') ?? []

  const handleRevenueChange = (categoryId: number, value: string) => {
    if (categoryId === entryFeeCategoryId) {
      setEntryFeeOverride(true)
    }
    setRevenues((prev: Record<number, string>) => ({ ...prev, [categoryId]: value }))
  }

  const handleCostChange = (categoryId: number, value: string) => {
    setCosts((prev: Record<number, CostState>) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], costValue: value },
    }))
  }

  const handleCostBasisChange = (
    categoryId: number,
    basis: 'exact' | 'estimated'
  ) => {
    setCosts((prev: Record<number, CostState>) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], costBasis: basis },
    }))
  }

  const hasAnyValue =
    Object.values(revenues).some((v) => v !== '') || kidsCount !== ''

  const buildPayload = () => {
    const entries = allNonPartyEntries
      .filter(
        (c) =>
          (revenues[c.categoryId] ?? '') !== '' ||
          (costs[c.categoryId]?.costValue ?? '') !== ''
      )
      .map((c) => ({
        categoryId: c.categoryId,
        revenue: parseFloat(revenues[c.categoryId] || '0') || 0,
        costAmount: costs[c.categoryId]?.costValue
          ? parseFloat(costs[c.categoryId].costValue)
          : null,
        costBasis: (costs[c.categoryId]?.costBasis ?? 'estimated') as
          | 'exact'
          | 'estimated',
      }))

    return {
      date: dateStr,
      entries,
      kidsCount: kidsCount !== '' ? parseInt(kidsCount, 10) : null,
    }
  }

  const handleSave = async () => {
    try {
      await save(buildPayload())
      toast.success(`${format(selectedDate, 'MMMM d')} saved`)
    } catch {
      toast.error("Couldn't save \u2014 check your connection")
    }
  }

  // Build cost entries for CostSection
  const costCategories: CostEntry[] = allNonPartyEntries.map((entry) => ({
    categoryId: entry.categoryId,
    displayName: entry.displayName,
    costValue: costs[entry.categoryId]?.costValue ?? '',
    costBasis: costs[entry.categoryId]?.costBasis ?? 'estimated',
    costMarginPct: entry.costMarginPct,
    revenue:
      revenues[entry.categoryId] && revenues[entry.categoryId] !== ''
        ? parseFloat(revenues[entry.categoryId])
        : null,
  }))

  return (
    <div className="max-w-[480px] mx-auto">
      <DateNavBar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onPrevDay={goToPrevDay}
        onNextDay={goToNextDay}
        onToday={goToToday}
        isToday={isToday}
      />

      <div
        className={`px-5 pt-6 pb-24 space-y-6 transition-opacity duration-150 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {!isLoading && !hasAnyValue && !data?.lastSaved && (
          <div className="rounded-xl bg-[#252220] border border-[#3D3530] p-4">
            <p className="text-[13px] text-[#9A8E82]">
              Start by entering today's numbers — revenue fields are grouped by business area.
            </p>
          </div>
        )}

        {retailEntries.length > 0 && (
          <RevenueSection title="Retail" accentColor="#E7C76A">
            {retailEntries.map((entry) => (
              <RevenueRow
                key={entry.categoryId}
                label={entry.displayName}
                value={revenues[entry.categoryId] ?? ''}
                onChange={(v) => handleRevenueChange(entry.categoryId, v)}
              />
            ))}
          </RevenueSection>
        )}

        {playroomEntries.length > 0 && (
          <RevenueSection title="Playroom & Caf&#233;" accentColor="#BFD8D2">
            {playroomEntries.map((entry) => {
              const isEntryFee = entry.categoryName === 'entry_fees'
              const autoCalcHint =
                isEntryFee && !entryFeeOverride && kidsCount !== ''
                  ? `${kidsCount} × €${ENTRY_FEE_PER_KID}`
                  : undefined
              return (
                <RevenueRow
                  key={entry.categoryId}
                  label={entry.displayName}
                  value={revenues[entry.categoryId] ?? ''}
                  onChange={(v) => handleRevenueChange(entry.categoryId, v)}
                  hint={autoCalcHint}
                />
              )
            })}
            <KidsCountRow value={kidsCount} onChange={handleKidsCountChange} />
          </RevenueSection>
        )}

        {allNonPartyEntries.length > 0 && (
          <CostSection
            categories={costCategories}
            onCostChange={handleCostChange}
            onCostBasisChange={handleCostBasisChange}
          />
        )}

        <SaveButton
          onSave={handleSave}
          isSaving={isSaving}
          disabled={!hasAnyValue}
          lastSaved={data?.lastSaved ?? null}
        />
      </div>

      <UnsavedChangesDialog
        open={pendingDate !== null}
        dateLabel={format(selectedDate, 'MMMM d')}
        onDiscard={confirmDiscard}
        onSave={() => confirmSave(buildPayload)}
        onCancel={cancelNavigation}
        isSaving={isSaving}
      />
    </div>
  )
}
