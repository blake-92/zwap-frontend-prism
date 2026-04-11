import { Search } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'

/**
 * SearchInput — input de búsqueda con estilo glass Prism UI.
 *
 * Props:
 *   value        string   — valor controlado
 *   onChange     fn       — handler (e) => void
 *   placeholder  string   — texto de placeholder
 *   className    string   — clases extra para el contenedor (ej: "w-72", "w-48")
 */
export default function SearchInput({ value, onChange, placeholder = 'Buscar...', className = 'w-full sm:w-72' }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`flex items-center px-4 py-2 rounded-xl transition-all ${
      isDarkMode
        ? 'bg-[#111113]/50 border border-white/5 focus-within:border-[#7C3AED]/40'
        : 'bg-white/60 border border-white focus-within:border-[#7C3AED]/30'
    } ${className}`}>
      <Search size={14} className={`flex-shrink-0 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={placeholder.replace('...', '').trim()}
        className={`bg-transparent border-none outline-none text-xs ml-2 w-full font-medium ${
          isDarkMode ? 'text-[#D8D7D9] placeholder:text-[#888991]' : 'text-[#111113] placeholder:text-[#B0AFB4]'
        }`}
      />
    </div>
  )
}
