import { forwardRef } from 'react'
import { useTheme } from '@/shared/context/ThemeContext'

const Input = forwardRef(function Input({ icon: Icon, prefix, error = false, className = '', ...props }, ref) {
  const { isDarkMode } = useTheme()

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          aria-hidden="true"
          className={`absolute left-4 top-3.5 pointer-events-none ${isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]'}`}
        />
      )}
      {prefix && !Icon && (
        <span aria-hidden="true" className={`absolute left-4 top-3.5 font-bold text-lg pointer-events-none ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={`
          w-full py-3 rounded-xl border outline-none transition-all font-medium
          ${Icon ? 'pl-11 pr-4' : prefix ? 'pl-8 pr-4' : 'px-4'}
          ${error
            ? isDarkMode
              ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)] placeholder-[#888991]'
              : 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            : isDarkMode
              ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] placeholder-[#888991]'
              : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-sm placeholder-[#B0AFB4]'
          }
          ${className}
        `}
        {...props}
      />
    </div>
  )
})

export default Input
