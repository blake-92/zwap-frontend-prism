import { SearchX } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

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
  const { isDarkMode } = useTheme()

  return (
    <tr>
      <td colSpan={colSpan} className="px-8 py-16 text-center">
        <div className="flex flex-col items-center justify-center animate-fade-in">
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
            No se encontraron resultados
          </h3>
          <p className={`text-sm font-medium max-w-[300px] mx-auto mb-6 ${
            isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
          }`}>
            No hay resultados que coincidan con &quot;{term}&quot;.
          </p>
          <Button variant="outline" onClick={onClear}>
            Limpiar búsqueda
          </Button>
        </div>
      </td>
    </tr>
  )
}
