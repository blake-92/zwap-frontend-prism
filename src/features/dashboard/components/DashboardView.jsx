import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { pageVariants } from '@/shared/utils/motionVariants'
import { Button, SegmentControl } from '@/shared/ui'
import { useTheme } from '@/shared/context/ThemeContext'
import { KPIS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import KpiCard        from './KpiCard'
import QuickLinkCard  from './QuickLinkCard'
import ChartCard      from './ChartCard'
import LiveFeed       from './LiveFeed'
import PendingCharges from './PendingCharges'
// Cross-feature dependency: Dashboard reuses the NewLinkModal from links feature
// via its public re-export. This avoids duplicating the modal component.
import { NewLinkModal } from '@/features/links'

export default function DashboardView() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  useViewSearch()
  const [newLinkOpen, setNewLinkOpen] = useState(false)
  const [activeTab, setActiveTab]     = useState('operations')

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      {/* Header bar: title + segment + action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight hidden sm:block ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {t('nav.dashboard')}
        </h1>

        <div className="flex-1 sm:max-w-xs">
          <SegmentControl
            options={[
              { value: 'operations', label: t('dashboard.tabOperations') },
              { value: 'metrics',    label: t('dashboard.tabMetrics') },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            layoutId="dashboardTab"
          />
        </div>

        <Button onClick={() => setNewLinkOpen(true)} className="hidden sm:flex sm:ml-auto">
          <Plus size={18} /> {t('dashboard.newReservationLink')}
        </Button>
      </div>

      {/* Mobile only: Full-width button */}
      <div className="sm:hidden mb-6">
        <Button size="lg" className="w-full" onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> {t('dashboard.newReservationLink')}
        </Button>
      </div>

      {activeTab === 'operations' && (
        <>
          {/* Row 1: Cobro Rápido + Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
            <QuickLinkCard />
            <LiveFeed onViewAll={() => navigate(ROUTES.TRANSACTIONS)} />
          </div>

          {/* Row 2: Cobros Pendientes */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 2xl:gap-8">
            <PendingCharges />
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
