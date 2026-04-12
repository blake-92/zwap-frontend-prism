import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants } from '@/shared/utils/motionVariants'
import { Button, PageHeader, SegmentControl } from '@/shared/ui'
import { KPIS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import KpiCard        from './KpiCard'
import QuickLinkCard  from './QuickLinkCard'
import ChartCard      from './ChartCard'
import LiveFeed       from './LiveFeed'
import AlertsPanel    from './AlertsPanel'
import PendingCharges from './PendingCharges'
import QuickActions   from './QuickActions'
import ShiftSummary   from './ShiftSummary'
// Cross-feature dependency: Dashboard reuses the NewLinkModal from links feature
// via its public re-export. This avoids duplicating the modal component.
import { NewLinkModal } from '@/features/links'

const DASHBOARD_TABS = [
  { value: 'operations', label: 'Operaciones' },
  { value: 'metrics',    label: 'Métricas' },
]

export default function DashboardView() {
  const navigate       = useNavigate()
  const [newLinkOpen, setNewLinkOpen] = useState(false)
  const [activeTab, setActiveTab]     = useState('operations')

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      <PageHeader
        title="Buenas noches, Admin 👋"
        description="Aquí tienes el pulso financiero de tus sucursales hoy."
        className="mb-6"
      >
        <Button onClick={() => setNewLinkOpen(true)} className="hidden sm:flex">
          <Plus size={18} /> Nuevo Link de Reserva
        </Button>
      </PageHeader>

      {/* Sub-view selector */}
      <div className="max-w-xs mb-6 sm:mb-8">
        <SegmentControl
          options={DASHBOARD_TABS}
          value={activeTab}
          onChange={setActiveTab}
          layoutId="dashboardTab"
        />
      </div>

      {/* Mobile only: Full-width button */}
      <div className="sm:hidden mb-6">
        <Button size="lg" className="w-full" onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> Nuevo Link de Reserva
        </Button>
      </div>

      {activeTab === 'operations' && (
        <>
          {/* Row 1: Cobro Rápido + Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
            <QuickLinkCard />
            <LiveFeed onViewAll={() => navigate(ROUTES.TRANSACTIONS)} />
          </div>

          {/* Row 2: Cobros Pendientes + Acciones/Resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
            <PendingCharges />
            <div className="flex flex-col gap-4 sm:gap-6 2xl:gap-8">
              <QuickActions onNewCharge={() => setNewLinkOpen(true)} />
              <ShiftSummary />
            </div>
          </div>

          {/* Row 3: Requiere Atención */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 2xl:gap-8">
            <AlertsPanel />
          </div>
        </>
      )}

      {activeTab === 'metrics' && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
            {KPIS.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8">
            <ChartCard />
          </div>
        </>
      )}

      <AnimatePresence>
        {newLinkOpen && <NewLinkModal key="new-link" onClose={() => setNewLinkOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
