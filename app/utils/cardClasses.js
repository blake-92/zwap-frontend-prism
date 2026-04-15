export function getCardClasses(isDarkMode, hoverEffect = false) {
  const base = isDarkMode
    ? 'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'
    : 'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'

  const hover = hoverEffect
    ? isDarkMode
      ? 'hover:-translate-y-1 hover:bg-[#252429]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)] active:translate-y-0 active:bg-[#252429]/60'
      : 'hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] active:translate-y-0 active:bg-white/90'
    : ''

  return { base, hover }
}

export const getModalGlass = (isDarkMode) => isDarkMode
  ? 'bg-[#252429]/80 backdrop-blur-3xl border border-white/20 border-t-white/30 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
  : 'bg-white/80 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'

export const getDropdownGlass = (isDarkMode) => isDarkMode
  ? 'bg-[#252429]/95 backdrop-blur-3xl border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
  : 'bg-white/95 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'
