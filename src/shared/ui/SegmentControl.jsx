import { useTheme } from '@/shared/context/ThemeContext'

export default function SegmentControl({ options, value, onChange }) {
  const { isDarkMode } = useTheme()
  return (
    <div className={`flex rounded-xl p-1.5 shadow-inner ${
      isDarkMode ? 'bg-black/60 border border-white/5' : 'bg-gray-200/50 border border-black/5'
    }`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
            value === opt.value
              ? isDarkMode
                ? 'bg-[#252429] text-white border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
                : 'bg-white text-[#7C3AED] shadow-md border border-[#7C3AED]/20'
              : isDarkMode
                ? 'text-[#888991] hover:text-[#D8D7D9]'
                : 'text-[#67656E] hover:text-[#111113]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
