import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button } from '@/shared/ui'
import { KPIS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import KpiCard       from './KpiCard'
import QuickLinkCard from './QuickLinkCard'
import ChartCard     from './ChartCard'
import LiveFeed      from './LiveFeed'
import AlertsPanel   from './AlertsPanel'
import NewLinkModal  from '@/features/links/components/NewLinkModal'

export default function DashboardView() {
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  const [newLinkOpen, setNewLinkOpen] = useState(false)

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Buenas noches, Admin 👋
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Aquí tienes el pulso financiero de tus sucursales hoy.
          </p>
        </div>
        <Button onClick={() => setNewLinkOpen(true)} className="hidden md:flex">
          <Plus size={18} /> Nueva Reserva
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {KPIS.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* Middle row: Quick cobro + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <QuickLinkCard onNewLink={() => setNewLinkOpen(true)} />
        <ChartCard />
      </div>

      {/* Bottom row: Live feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveFeed onViewAll={() => navigate(ROUTES.TRANSACTIONS)} />
        <AlertsPanel />
      </div>

      {newLinkOpen && <NewLinkModal onClose={() => setNewLinkOpen(false)} />}
    </div>
  )
}
