import { useTheme } from '@/shared/context/ThemeContext'

export default function Input({ icon: Icon, className = '', ...props }) {
  const { isDarkMode } = useTheme()

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className={`absolute left-4 top-3.5 pointer-events-none ${isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]'}`}
        />
      )}
      <input
        className={`
          w-full py-3 rounded-xl border outline-none transition-all font-medium
          ${Icon ? 'pl-11 pr-4' : 'px-4'}
          ${isDarkMode
            ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] placeholder-[#888991]'
            : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-sm placeholder-[#B0AFB4]'
          }
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
