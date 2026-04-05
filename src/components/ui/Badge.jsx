import { useTheme } from '../../context/ThemeContext'

/**
 * Badge — Prism UI pill label
 * variants: default | success | warning | danger | outline
 */
export default function Badge({ variant = 'default', className = '', children, icon: Icon }) {
  const { isDarkMode } = useTheme()

  const variants = {
    default: isDarkMode
      ? 'bg-[#7C3AED]/15 text-[#B9A4F8] border-[#7C3AED]/30'
      : 'bg-[#DBD3FB]/60 text-[#561BAF] border-[#DBD3FB]',
    success: isDarkMode
      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: isDarkMode
      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
      : 'bg-amber-50 text-amber-600 border-amber-200',
    danger: isDarkMode
      ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
      : 'bg-rose-50 text-rose-600 border-rose-200',
    outline: isDarkMode
      ? 'bg-[#111113]/50 border-white/10 text-[#D8D7D9]'
      : 'bg-white/80 border-white text-[#45434A]',
  }

  return (
    <span className={`
      px-2.5 py-1 rounded-md text-[11px] font-bold
      inline-flex items-center gap-1.5 border backdrop-blur-md shadow-sm
      ${variants[variant]} ${className}
    `}>
      {Icon && <Icon size={12} strokeWidth={3} />}
      {children}
    </span>
  )
}
