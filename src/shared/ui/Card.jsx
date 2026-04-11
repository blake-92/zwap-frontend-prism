import { useTheme } from '@/shared/context/ThemeContext'
import { getCardClasses } from '@/shared/utils/cardClasses'

export default function Card({ children, className = '', hoverEffect = false, onClick, style }) {
  const { isDarkMode } = useTheme()
  const { base, hover } = getCardClasses(isDarkMode, hoverEffect)

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
