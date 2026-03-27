import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateNavBarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  isToday: boolean
}

export function DateNavBar({
  selectedDate,
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
  isToday,
}: DateNavBarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  return (
    <div className="sticky top-0 z-10 bg-[#252220] border-b border-[#3D3530] px-4 py-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 text-[#C4B8A8] hover:text-[#E8E0D4] hover:bg-[#3D3530]"
          onClick={onPrevDay}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            className="font-serif text-lg font-semibold text-[#E8E0D4] hover:text-[#E7C76A] cursor-pointer bg-transparent border-none px-3 py-1 transition-colors"
          >
            {format(selectedDate, 'EEE, MMMM d')}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date)
                  setCalendarOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 text-[#C4B8A8] hover:text-[#E8E0D4] hover:bg-[#3D3530]"
          onClick={onNextDay}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {!isToday && (
        <div className="flex justify-center mt-2">
          <button
            onClick={onToday}
            className="px-3 py-1 text-xs font-medium rounded-full bg-[#E7C76A]/20 text-[#E7C76A] hover:bg-[#E7C76A]/30 transition-colors"
          >
            Today
          </button>
        </div>
      )}
    </div>
  )
}
