import { useTheme } from '@/shared/context/ThemeContext'

/**
 * SectionLabel — Prism UI
 *
 * Etiqueta de sección uppercase con color de texto secundario estándar.
 * Usada como encabezado de subsección en modales, cards y vistas.
 *
 * Props:
 *   children    node      — texto o contenido del label
 *   className   string?   — clases extra para mb-N, uppercase, text-sm, flex, etc.
 */
export default function SectionLabel({ children, className = '' }) {
  const { isDarkMode } = useTheme()

  return (
    <p className={`text-xs font-bold tracking-widest ${
      isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'
    } ${className}`}>
      {children}
    </p>
  )
}
