import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, PageHeader } from '@/shared/ui'
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
  <>
      <PageHeader
        title="Buenas noches, Admin 👋"
        description="Aquí tienes el pulso financiero de tus sucursales hoy."
        className="mb-10"
      >
        <Button onClick={() => setNewLinkOpen(true)} className="hidden md:flex">
          <Plus size={18} /> Nueva Reserva
        </Button>
      </PageHeader>

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
  </>
  )
}
