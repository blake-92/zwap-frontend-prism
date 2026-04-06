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
      ? 'bg-[#7C3AED] hover:bg-[#561BAF] text-white shadow-[0_8px_30px_rgba(124,58,237,0.4)] border border-[#7C3AED]/60 border-t-[#B9A4F8]/50'
      : 'bg-[#7C3AED] hover:bg-[#561BAF] text-white shadow-[0_8px_25px_rgba(124,58,237,0.3)] border border-[#7C3AED]/30 border-t-white/50',
    outline: isDarkMode
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-white/5'
      : 'bg-white/60 border border-white text-[#45434A] hover:bg-white shadow-sm',
    ghost: isDarkMode
      ? 'bg-transparent hover:bg-white/10 text-[#888991] hover:text-white border border-transparent'
      : 'bg-transparent hover:bg-black/5 text-[#67656E] hover:text-[#111113] border border-transparent',
    action: isDarkMode
      ? 'text-[#B9A4F8] bg-[#7C3AED]/10 border border-[#7C3AED]/20 hover:bg-[#7C3AED]/30 hover:border-[#7C3AED]/50'
      : 'text-[#7C3AED] bg-[#DBD3FB]/50 border border-[#DBD3FB] hover:bg-[#DBD3FB] hover:text-[#561BAF]',
    danger: isDarkMode
      ? 'text-[#888991] bg-transparent border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40'
      : 'text-[#67656E] bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
    successExport: isDarkMode
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30'
      : 'bg-white/60 border border-white text-[#45434A] hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm',
  }

  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-colors duration-200 outline-none rounded-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${SIZES[size]} ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
