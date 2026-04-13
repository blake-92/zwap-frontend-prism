import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

const SIZES = {
  default: 'px-5 py-2.5 text-sm',
  sm:      'px-4 py-2 text-xs',
  lg:      'px-6 py-3 text-base',
  icon:    'p-2 w-9 h-9',
}

export default function Button({
  variant   = 'default',
  size      = 'default',
  className = '',
  children,
  onClick,
  disabled,
  type      = 'button',
  title,
  ...props
}) {
  const { isDarkMode } = useTheme()

  const variants = {
    default: isDarkMode
      ? 'bg-[#7C3AED] hover:bg-[#561BAF] active:bg-[#4C1599] text-white shadow-[0_8px_30px_rgba(124,58,237,0.4)] border border-[#7C3AED]/60 border-t-[#B9A4F8]/50'
      : 'bg-[#7C3AED] hover:bg-[#561BAF] active:bg-[#4C1599] text-white shadow-[0_8px_25px_rgba(124,58,237,0.3)] border border-[#7C3AED]/30 border-t-white/50',
    outline: isDarkMode
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-white/5 active:bg-white/10'
      : 'bg-white/60 border border-white text-[#45434A] hover:bg-white active:bg-gray-100 shadow-sm',
    ghost: isDarkMode
      ? 'bg-transparent hover:bg-white/10 active:bg-white/15 text-[#888991] hover:text-white border border-transparent'
      : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-[#67656E] hover:text-[#111113] border border-transparent',
    action: isDarkMode
      ? 'text-[#B9A4F8] bg-[#7C3AED]/10 border border-[#7C3AED]/20 hover:bg-[#7C3AED]/30 active:bg-[#7C3AED]/40 hover:border-[#7C3AED]/50'
      : 'text-[#7C3AED] bg-[#DBD3FB]/50 border border-[#DBD3FB] hover:bg-[#DBD3FB] active:bg-[#CEC3F5] hover:text-[#561BAF]',
    danger: isDarkMode
      ? 'text-[#888991] bg-transparent border border-white/10 hover:bg-rose-500/20 active:bg-rose-500/30 hover:text-rose-400 hover:border-rose-500/40'
      : 'text-[#67656E] bg-white border border-gray-200 hover:bg-rose-50 active:bg-rose-100 hover:text-rose-600 hover:border-rose-200',
    successExport: isDarkMode
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-emerald-500/15 active:bg-emerald-500/25 hover:text-emerald-400 hover:border-emerald-500/30'
      : 'bg-white/60 border border-white text-[#45434A] hover:bg-emerald-50 active:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-200 shadow-sm',
  }

  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-colors duration-200 outline-none rounded-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${SIZES[size]} ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
