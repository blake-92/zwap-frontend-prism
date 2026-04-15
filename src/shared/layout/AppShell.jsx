import { useState, useEffect, useRef, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { ErrorBoundary, PageLoader } from '@/shared/ui'
import { BRANCHES } from '@/services/mocks/mockData'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Sidebar   from './Sidebar'
import Header    from './Header'
import BottomNav from './BottomNav'
import { SPRING } from '@/shared/utils/springs'

export default function AppShell() {
  const { isDarkMode }      = useTheme()
  const [branch, setBranch] = useState(BRANCHES[0])
  const isDesktop           = useMediaQuery('(min-width: 1024px)')

  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('zwap-sidebar') === 'collapsed'
  )

  // Scroll-aware header (mobile only)
  const mainRef       = useRef(null)
  const lastScrollY   = useRef(0)
  const [headerVisible, setHeaderVisible] = useState(true)

  // Prevent document scroll — ensures main is always the scroll container.
  // Without this, iOS Safari and Chrome Android propagate scroll to the body,
  // causing the header to disappear and the browser chrome to auto-hide.
  // iOS Safari requires overflow:hidden on BOTH html and body to fully contain
  // scroll to the main element; body alone is not sufficient on iOS.
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (isDesktop) {
      setHeaderVisible(true)
      return
    }
    const el = mainRef.current
    if (!el) return
    const onScroll = () => {
      const y     = el.scrollTop
      const delta = y - lastScrollY.current
      if (y <= 4)       setHeaderVisible(true)
      else if (delta > 8)  setHeaderVisible(false)
      else if (delta < -8) setHeaderVisible(true)
      lastScrollY.current = Math.max(0, y)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isDesktop])

  const toggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('zwap-sidebar', next ? 'collapsed' : 'expanded')
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
    }`}>

      {/* ── Sidebar + toggle button wrapper (desktop only) ── */}
      {isDesktop && (
        <div className="relative flex-shrink-0 group/sidebar">
          <Sidebar isCollapsed={isCollapsed} />

          {/* Borde hover hint */}
          <div className={`absolute inset-y-0 right-0 w-px transition-colors duration-300
            group-hover/sidebar:bg-[#7C3AED]/40 ${
              isDarkMode ? 'bg-white/10' : 'bg-black/5'
            }`}
          />

          {/* Toggle button */}
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
              title={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
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
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <Header selectedBranch={branch} onBranchChange={setBranch} isDesktop={isDesktop} headerVisible={headerVisible} />

        <main
          ref={mainRef}
          className={`flex-1 overflow-auto overscroll-y-contain ${
            isDesktop
              ? 'px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 lg:pb-10 xl:pb-12 2xl:pb-16'
              : 'px-4 sm:px-6 pt-20'
          }`}
          style={!isDesktop ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' } : undefined}
        >
          <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* ── Bottom nav (mobile / tablet only) ── */}
      {!isDesktop && <BottomNav />}
    </div>
  )
}
