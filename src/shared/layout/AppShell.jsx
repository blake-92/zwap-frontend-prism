import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'
import { BRANCHES } from '@/services/mocks/mockData'
import Sidebar from './Sidebar'
import Header  from './Header'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
}

export default function AppShell() {
  const { isDarkMode }      = useTheme()
  const location            = useLocation()
  const [branch, setBranch] = useState(BRANCHES[0])

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
    }`}>
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <Header selectedBranch={branch} onBranchChange={setBranch} />

        <main className="flex-1 overflow-auto p-8 xl:p-10 pb-24 xl:pb-32">
          <div className="max-w-[1400px] mx-auto h-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
