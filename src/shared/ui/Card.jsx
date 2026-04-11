import { useTheme } from '@/shared/context/ThemeContext'

export default function Card({ children, className = '', hoverEffect = false, onClick, style }) {
  const { isDarkMode } = useTheme()

  const hover = hoverEffect
    ? isDarkMode
      ? 'hover:-translate-y-1 hover:bg-[#252429]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]'
      : 'hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
    : ''

  const base = isDarkMode
    ? 'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'
    : 'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'

  const interactive = onClick
    ? { role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } } }
    : {}

  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-[24px] border transition-all duration-300 transform-gpu overflow-hidden ${base} ${hover} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...interactive}
    >
      {children}
    </div>
  )
}
