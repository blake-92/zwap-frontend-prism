import { User } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Avatar from './Avatar'

/**
 * AvatarInfo — Prism UI
 *
 * Bloque de avatar + nombre + línea secundaria para filas de tabla.
 * Si no hay initials muestra un círculo punteado con ícono anónimo.
 *
 * Props:
 *   initials    string?   — 1-2 chars para el Avatar; null/undefined → círculo anónimo
 *   primary     node      — texto principal (negrita)
 *   secondary   node?     — texto secundario (muted)
 *   meta        string?   — texto monoespaciado entre paréntesis junto al primary (ej. ID)
 *   glow        bool?     — group-hover shadow en el Avatar. Default: false
 */
export default function AvatarInfo({ initials, primary, secondary, meta, glow = false }) {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex items-center gap-3 min-w-0">
      {initials ? (
        <Avatar initials={initials} glow={glow} />
      ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed flex-shrink-0 ${
          isDarkMode ? 'bg-[#111113]/50 border-white/20 text-[#888991]' : 'bg-gray-50 border-gray-300 text-gray-400'
        }`}>
          <User size={16} />
        </div>
      )}
      <div className="min-w-0">
        <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
          {primary}
          {meta && <span className="font-mono text-[10px] text-[#888991] ml-1">({meta})</span>}
        </p>
        {secondary && (
          <p className={`text-xs mt-0.5 font-medium truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            {secondary}
          </p>
        )}
      </div>
    </div>
  )
}
