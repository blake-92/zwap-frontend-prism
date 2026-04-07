import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

export default function Toggle({ active, onToggle, disabled = false }) {
  const { isDarkMode } = useTheme()
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle && onToggle()}
      role="switch"
      aria-checked={active}
      disabled={disabled}
      className={`w-10 h-5 rounded-full p-0.5 flex items-center outline-none transition-colors duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        active
          ? isDarkMode
            ? 'bg-[#7C3AED] border border-[#7C3AED]/50 shadow-[0_0_12px_rgba(124,58,237,0.4)]'
            : 'bg-[#7C3AED] border border-[#7C3AED]/30'
          : isDarkMode
            ? 'bg-[#252429] border border-white/10'
            : 'bg-gray-200 border border-gray-300'
      }`}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ x: active ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
