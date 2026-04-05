import { useTheme } from '../../context/ThemeContext'

/**
 * GlassBackground — Auras de fondo Prism UI
 * Renderiza los dos blobs de gradiente que definen el ambiente de la app
 */
export default function GlassBackground() {
  const { isDarkMode } = useTheme()

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]'
    }`}>
      {/* Aura top-left */}
      <div className={`absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] transition-colors duration-500 ${
        isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#7C3AED]/20'
      }`} />
      {/* Aura bottom-right */}
      <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] transition-colors duration-500 ${
        isDarkMode ? 'bg-[#300C67]/40' : 'bg-[#561BAF]/15'
      }`} />
    </div>
  )
}
