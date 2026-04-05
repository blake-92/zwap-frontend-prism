import { useState, useEffect, useRef } from 'react'
import { Search, Moon, Sun, Bell, ChevronDown, Building2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui'
import { BRANCHES } from '../../data/mockData'

export default function Header({ selectedBranch, onBranchChange }) {
  const { isDarkMode, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
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

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-[2px] ${
            isDarkMode
              ? 'bg-[#7C3AED] border-[#111113] shadow-[0_0_10px_rgba(124,58,237,0.9)]'
              : 'bg-red-500 border-white shadow-[0_0_10px_rgba(239,68,68,0.6)]'
          }`} />
        </Button>

        {/* Branch selector */}
        <div ref={menuRef} className="relative">
          <div
            onClick={() => setMenuOpen(v => !v)}
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
            <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''} ${
              isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
            }`} />
          </div>

          {menuOpen && (
            <div className={`absolute right-0 mt-4 w-56 rounded-2xl z-50 overflow-hidden border shadow-2xl animate-scale-in ${
              isDarkMode
                ? 'bg-[#252429]/95 backdrop-blur-3xl border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
                : 'bg-white/95 backdrop-blur-3xl border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'
            }`}>
              <div className="p-2 space-y-1">
                {BRANCHES.map(branch => {
                  const isSelected = selectedBranch === branch
                  return (
                    <button
                      key={branch}
                      onClick={() => { onBranchChange(branch); setMenuOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-[#7C3AED]/25 text-[#7C3AED] border border-[#7C3AED]/30'
                            : 'bg-[#DBD3FB]/60 text-[#561BAF] border border-[#DBD3FB]'
                          : isDarkMode
                            ? 'text-[#D8D7D9] hover:bg-white/10 border border-transparent'
                            : 'text-[#45434A] hover:bg-black/5 border border-transparent'
                      }`}
                    >
                      <Building2 size={16} className={isSelected ? 'text-[#7C3AED]' : 'opacity-50'} />
                      {branch}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
