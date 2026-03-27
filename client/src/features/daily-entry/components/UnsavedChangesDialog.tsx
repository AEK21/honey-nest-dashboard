import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

interface UnsavedChangesDialogProps {
  open: boolean
  dateLabel: string
  onDiscard: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

export function UnsavedChangesDialog({
  open,
  dateLabel,
  onDiscard,
  onSave,
  onCancel,
  isSaving,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="bg-[#252220] border-[#3D3530] text-[#E8E0D4]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#E8E0D4] text-base font-semibold">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#9A8E82] text-sm">
            You have unsaved changes for {dateLabel}. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-[#3D3530] bg-[#1E1B18]/50">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-[#D4564E]/40 text-[#D4564E] text-sm font-medium hover:bg-[#D4564E]/10 transition-colors disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-[#E7C76A] text-[#1C1917] text-sm font-semibold hover:bg-[#EDD07E] transition-colors disabled:opacity-50 min-w-[130px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Save & continue'
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
