import { useTheme } from '@/shared/context/ThemeContext'

/**
 * CardHeader — Prism UI
 *
 * Encabezado estándar para cards internas: título + descripción a la izquierda,
 * slot de acción (Badge, Button, etc.) a la derecha. Incluye border-b.
 *
 * Props:
 *   title       node      — título del card (puede incluir íconos o elementos animados)
 *   description string?   — subtítulo muted bajo el título
 *   className   string?   — clases extra en el contenedor (e.g. padding override)
 *   children    node?     — slot derecho (Badge, Button, etc.)
 */
export default function CardHeader({ title, description, className = 'p-6', children }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`border-b flex justify-between items-center ${
      isDarkMode ? 'border-white/10' : 'border-black/5'
    } ${className}`}>
      <div>
        <h3 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  )
}
