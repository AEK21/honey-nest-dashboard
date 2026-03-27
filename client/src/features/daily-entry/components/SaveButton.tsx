import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface SaveButtonProps {
  onSave: () => void
  isSaving: boolean
  disabled: boolean
  lastSaved: string | null
}

export function SaveButton({
  onSave,
  isSaving,
  disabled,
  lastSaved,
}: SaveButtonProps) {
  return (
    <div className="pt-2 space-y-3">
      <button
        onClick={onSave}
        disabled={disabled || isSaving}
        className="w-full h-[52px] rounded-xl bg-[#E7C76A] text-[#1C1917] text-[15px] font-bold tracking-wide hover:bg-[#EDD07E] hover:shadow-[0_0_24px_rgba(231,199,106,0.35)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(231,199,106,0.2)]"
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          'Save Day'
        )}
      </button>
      <p className="text-xs text-[#9A8E82] text-center tracking-wide">
        {lastSaved
          ? `Last saved: ${format(new Date(lastSaved), 'HH:mm')}`
          : 'Not yet saved'}
      </p>
    </div>
  )
}
