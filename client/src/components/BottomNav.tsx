import { useLocation, useNavigate } from 'react-router-dom'
import { PenLine, BarChart3 } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Entry', icon: PenLine },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#3D3530] bg-[#252220]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[600px] flex">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active
                  ? 'text-[#E7C76A]'
                  : 'text-[#7A6F63] hover:text-[#C4B8A8]'
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium tracking-wide">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
