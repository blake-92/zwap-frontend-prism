/**
 * getCardClasses — Prism UI
 *
 * Clases base del glass card de Prism. Usado por `Card` y `SwipeableCard`
 * para mantener un único origen de verdad del estilo glass.
 *
 * @param {boolean} isDarkMode
 * @param {boolean} [hoverEffect=false] — aplica elevación + sombra reforzada en hover
 */
export function getCardClasses(isDarkMode, hoverEffect = false) {
  const base = isDarkMode
    ? 'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'
    : 'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'

  const hover = hoverEffect
    ? isDarkMode
      ? 'hover:-translate-y-1 hover:bg-[#252429]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]'
      : 'hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
    : ''

  return { base, hover }
}
