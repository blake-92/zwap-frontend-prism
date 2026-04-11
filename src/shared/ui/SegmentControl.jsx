import { useId } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

/**
 * SegmentControl — Prism UI
 *
 * Pill animado con spring (Framer Motion layoutId).
 * El indicador desliza suavemente entre opciones.
 *
 * Props:
 *   options   [{ value, label }]  — segmentos a mostrar
 *   value     string              — valor activo
 *   onChange  fn(value)           — callback de selección
 *   layoutId  string?             — id para el layout animation (auto si se omite)
 */
export default function SegmentControl({ options, value, onChange, layoutId: layoutIdProp }) {
  const { isDarkMode } = useTheme()
  const autoId   = useId()
  const layoutId = layoutIdProp ?? `segment-${autoId}`

  return (
    <div role="tablist" className={`flex rounded-xl p-1.5 shadow-inner ${
      isDarkMode
        ? 'bg-black/60 border border-white/5'
        : 'bg-gray-200/50 border border-black/5'
    }`}>
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-300 ${
            value === opt.value
              ? isDarkMode ? 'text-white' : 'text-[#7C3AED]'
              : isDarkMode
                ? 'text-[#888991] hover:text-[#D8D7D9]'
                : 'text-[#67656E] hover:text-[#111113]'
          }`}
        >
          {value === opt.value && (
            <motion.div
              layoutId={layoutId}
              className={`absolute inset-0 rounded-lg ${
                isDarkMode
                  ? 'bg-[#252429] border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                  : 'bg-white border border-[#7C3AED]/20 shadow-md'
              }`}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
