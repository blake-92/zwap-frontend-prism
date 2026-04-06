import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

export default function DropdownFilter({ label, options, value, onChange, icon: Icon }) {
  const { isDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`!px-3 flex items-center gap-1.5 transition-all ${
          isOpen
            ? isDarkMode
              ? 'bg-[#111113]/80 border-[#7C3AED]/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]'
              : 'bg-white border-[#7C3AED]/40 text-[#111113]'
            : ''
        }`}
      >
        {Icon && <Icon size={14} className={value !== 'Todos' && value !== '' ? 'text-[#7C3AED]' : 'opacity-70'} />}
        <span className="font-semibold">
          {label}{value && value !== 'Todos' ? `: ${value}` : ''}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 min-w-[180px] rounded-2xl border shadow-2xl animate-scale-in z-50 overflow-hidden ${
          isDarkMode
            ? 'bg-[#252429]/95 backdrop-blur-xl border-white/10'
            : 'bg-white/95 backdrop-blur-xl border-gray-200'
        }`}>
          <div className="p-1.5 flex flex-col gap-0.5">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false) }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  value === opt
                    ? isDarkMode ? 'bg-[#7C3AED]/15 text-white' : 'bg-[#DBD3FB]/50 text-[#561BAF]'
                    : isDarkMode ? 'text-[#888991] hover:bg-white/5 hover:text-[#D8D7D9]' : 'text-[#67656E] hover:bg-gray-100 hover:text-[#111113]'
                }`}
              >
                {opt}
                {value === opt && <Check size={14} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
