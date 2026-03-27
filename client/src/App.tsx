import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { BottomNav } from './components/BottomNav'
import { DailyEntryPage } from './features/daily-entry/DailyEntryPage'
import { DashboardPage } from './features/dashboard/DashboardPage'

function App() {
  return (
    <div className="min-h-screen bg-[#1C1917] text-[#E8E0D4]">
      <Routes>
        <Route path="/" element={<DailyEntryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
