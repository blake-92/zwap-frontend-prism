import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants } from '@/shared/utils/motionVariants'
import { Button, PageHeader } from '@/shared/ui'
import { KPIS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import KpiCard       from './KpiCard'
import QuickLinkCard from './QuickLinkCard'
import ChartCard     from './ChartCard'
import LiveFeed      from './LiveFeed'
import AlertsPanel   from './AlertsPanel'
// Cross-feature dependency: Dashboard reuses the NewLinkModal from links feature
// via its public re-export. This avoids duplicating the modal component.
import { NewLinkModal } from '@/features/links'

export default function DashboardView() {
  const navigate       = useNavigate()
  const [newLinkOpen, setNewLinkOpen] = useState(false)

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      <PageHeader
        title="Buenas noches, Admin 👋"
        description="Aquí tienes el pulso financiero de tus sucursales hoy."
        className="mb-10"
      >
        <Button onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> <span className="hidden sm:inline">Nueva Reserva</span>
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
        {KPIS.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Middle row: Quick cobro + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
        <QuickLinkCard />
        <ChartCard />
      </div>

      {/* Bottom row: Live feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8">
        <LiveFeed onViewAll={() => navigate(ROUTES.TRANSACTIONS)} />
        <AlertsPanel />
      </div>

      <AnimatePresence>
        {newLinkOpen && <NewLinkModal key="new-link" onClose={() => setNewLinkOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
