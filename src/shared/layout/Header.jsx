import { useState, useEffect, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Moon, Sun, Bell, ChevronDown, Building2, Settings } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/router/routes'
import { Button, Tooltip } from '@/shared/ui'
import { BRANCHES } from '@/services/mocks/mockData'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { ...SPRING, stiffness: 500 } },
  exit:    { opacity: 0, scale: 0.95, y: -4,  transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

export default function Header({ selectedBranch, onBranchChange }) {
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate                    = useNavigate()
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef(null)
  const pillId                      = useId()

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className={`relative z-50 h-20 flex items-center justify-between px-10 flex-shrink-0 transition-all duration-500 ${
      isDarkMode
        ? 'bg-[#111113]/20 backdrop-blur-2xl border-b border-white/10'
        : 'bg-white/30 backdrop-blur-2xl border-b border-white/80'
    }`}>

      {/* Search */}
      <div className={`flex items-center px-4 py-2.5 rounded-xl border w-[400px] transition-all duration-300 ${
        isDarkMode
          ? 'bg-[#252429]/30 backdrop-blur-xl border-white/10 border-t-white/20 focus-within:border-[#7C3AED]/60 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.2)] focus-within:bg-[#252429]/50'
          : 'bg-white/50 backdrop-blur-xl border-white focus-within:border-[#7C3AED]/40 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.15)] focus-within:bg-white/80 shadow-[0_4px_15px_rgb(0,0,0,0.02)]'
      }`}>
        <Search size={16} className={isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'} />
        <input
          type="text"
          placeholder="Buscar transacciones, links o clientes..."
          className={`bg-transparent border-none outline-none text-sm ml-3 w-full font-medium placeholder:opacity-60 ${
            isDarkMode ? 'text-[#D8D7D9] placeholder:text-[#888991]' : 'text-[#111113] placeholder:text-[#B0AFB4]'
          }`}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Tooltip content="Modo Oscuro/Claro" position="bottom">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </Tooltip>

        <Tooltip content="Configuración" position="bottom">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.SETTINGS)}>
            <Settings size={20} />
          </Button>
        </Tooltip>

        <Tooltip content="Notificaciones" position="bottom">
          <Button variant="ghost" size="icon" className="relative">
            <motion.span
              whileHover={{ rotate: [0, -18, 14, -10, 6, 0] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              <Bell size={20} />
            </motion.span>
            <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-[2px] ${
              isDarkMode
                ? 'bg-[#7C3AED] border-[#111113] shadow-[0_0_10px_rgba(124,58,237,0.9)]'
                : 'bg-red-500 border-white shadow-[0_0_10px_rgba(239,68,68,0.6)]'
            }`} />
          </Button>
        </Tooltip>

        {/* Branch selector */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            onKeyDown={e => { if (e.key === 'Escape') setMenuOpen(false) }}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className={`flex items-center gap-3 cursor-pointer pl-6 border-l h-10 transition-colors select-none ${
              isDarkMode ? 'border-white/10' : 'border-black/5'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              isDarkMode
                ? 'bg-[#7C3AED]/15 backdrop-blur-xl border border-[#7C3AED]/40 text-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                : 'bg-white/90 border border-white shadow-md text-[#7C3AED] backdrop-blur-xl'
            }`}>
              {selectedBranch.charAt(0)}
            </div>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
              {selectedBranch}
            </span>
            <motion.span
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={SPRING}
              className={`flex items-center ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ transformOrigin: 'top right' }}
                className={`absolute right-0 mt-4 w-56 rounded-2xl z-50 overflow-hidden border shadow-2xl ${
                  isDarkMode
                    ? 'bg-[#252429]/95 backdrop-blur-3xl border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
                    : 'bg-white/95 backdrop-blur-3xl border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'
                }`}
              >
                <div className="p-2 flex flex-col gap-0.5">
                  {BRANCHES.map(branch => {
                    const isSelected = selectedBranch === branch
                    return (
                      <button
                        key={branch}
                        onClick={() => { onBranchChange(branch); setMenuOpen(false) }}
                        className={`relative w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors duration-150 ${
                          isSelected
                            ? isDarkMode ? 'text-white' : 'text-[#561BAF]'
                            : isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId={`branch-pill-${pillId}`}
                            className={`absolute inset-0 rounded-xl ${
                              isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50'
                            }`}
                            transition={SPRING}
                          />
                        )}
                        <Building2 size={16} className={`relative z-10 ${isSelected ? 'text-[#7C3AED]' : 'opacity-50'}`} />
                        <span className="relative z-10">{branch}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
