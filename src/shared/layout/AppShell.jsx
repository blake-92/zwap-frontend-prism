import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { BRANCHES } from '@/services/mocks/mockData'
import Sidebar from './Sidebar'
import Header  from './Header'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
    </div>
  )
}

export default function AppShell() {
  const { isDarkMode }      = useTheme()
  const [branch, setBranch] = useState(BRANCHES[0])

  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('zwap-sidebar') === 'collapsed'
  )

  const toggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('zwap-sidebar', next ? 'collapsed' : 'expanded')
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
    }`}>

      {/* ── Sidebar + toggle button wrapper ── */}
      <div className="relative flex-shrink-0 group/sidebar">
        <Sidebar isCollapsed={isCollapsed} />

        {/* Borde hover hint — línea que brilla al acercar el cursor */}
        <div className={`absolute inset-y-0 right-0 w-px transition-colors duration-300
          group-hover/sidebar:bg-[#7C3AED]/40 ${
            isDarkMode ? 'bg-white/10' : 'bg-black/5'
          }`}
        />

        {/* Toggle button — vive fuera del aside, centrado verticalmente */}
        <motion.div
          className="absolute z-30"
          style={{ top: '50%', translateY: '-50%' }}
          animate={{ left: isCollapsed ? 60 : 244 }}
          transition={SPRING}
        >
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING}
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-lg ${
              isDarkMode
                ? 'bg-[#252429] backdrop-blur-md border-white/20 text-[#888991] hover:text-white hover:border-[#7C3AED]/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                : 'bg-white backdrop-blur-md border-black/10 text-[#67656E] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
            }`}
          >
            <motion.span
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={SPRING}
              className="flex items-center justify-center"
            >
              <ChevronRight size={12} />
            </motion.span>
          </motion.button>
        </motion.div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <Header selectedBranch={branch} onBranchChange={setBranch} />

        <main className="flex-1 overflow-auto p-8 xl:p-10 pb-24 xl:pb-32">
          <div className="max-w-[1400px] mx-auto h-full">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
