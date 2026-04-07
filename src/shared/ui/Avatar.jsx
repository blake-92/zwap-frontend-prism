import { useTheme } from '@/shared/context/ThemeContext'

/**
 * Avatar — Prism UI
 *
 * Círculo de iniciales estándar para tablas y sidebars.
 *
 * Props:
 *   initials   string    — 1-2 caracteres a mostrar
 *   size       'sm'|'md' — w-9 (sidebar) o w-10 (tablas). Default: 'md'
 *   variant    'purple'|'neutral' — púrpura de marca o gris neutro. Default: 'purple'
 *   glow       bool      — agrega group-hover shadow púrpura. Default: false
 */
export default function Avatar({ initials, size = 'md', variant = 'purple', glow = false }) {
  const { isDarkMode } = useTheme()

  const sizeClass = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'

  const variantClass = variant === 'neutral'
    ? isDarkMode
      ? 'bg-[#252429] border border-white/15 text-[#D8D7D9]'
      : 'bg-white border border-black/10 text-[#45434A] shadow-sm'
    : isDarkMode
      ? `bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30${glow ? ' group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : ''}`
      : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all ${variantClass}`}>
      {initials}
    </div>
  )
}
