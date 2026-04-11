import { useTheme } from '@/shared/context/ThemeContext'

/**
 * PageHeader — Prism UI
 *
 * Header estándar de vista: título h1 + descripción + slot de acción opcional.
 *
 * Props:
 *   title        string    — texto del h1
 *   description  string    — subtítulo descriptivo
 *   className    string?   — clase wrapper (default 'mb-8')
 *   children     node?     — acción derecha (botón, etc.)
 */
export default function PageHeader({ title, description, className = 'mb-8', children }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 ${className}`}>
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {title}
        </h1>
        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          {description}
        </p>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  )
}
