import { SearchX } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 300, damping: 24 }

/**
 * EmptySearchState — fila de estado vacío para tablas con búsqueda.
 * Renderiza un <tr><td> listo para usarse dentro de <tbody>.
 *
 * Props:
 *   colSpan  number  — número de columnas de la tabla
 *   term     string  — texto buscado (para mostrar en el mensaje)
 *   onClear  fn      — callback para limpiar la búsqueda
 */
export default function EmptySearchState({ colSpan, term, onClear }) {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <tr>
      <td colSpan={colSpan} className="px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="flex flex-col items-center justify-center"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            isDarkMode
              ? 'bg-[#111113]/50 border border-white/10 text-[#888991]'
              : 'bg-gray-50 border border-gray-200 text-[#B0AFB4]'
          }`}>
            <SearchX size={32} strokeWidth={1.5} />
          </div>
          <h3 className={`text-lg font-bold mb-2 tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#111113]'
          }`}>
            {t('errors.noResults')}
          </h3>
          <p className={`text-sm font-medium max-w-[300px] mx-auto mb-6 ${
            isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
          }`}>
            {t('errors.noResultsFor', { term })}
          </p>
          <Button variant="outline" onClick={onClear}>
            {t('common.clearSearch')}
          </Button>
        </motion.div>
      </td>
    </tr>
  )
}
