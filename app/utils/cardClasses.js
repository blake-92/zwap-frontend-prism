export function getCardClasses(isDarkMode, hoverEffect = false, useBlur = true) {
  const base = isDarkMode
    ? useBlur
      ? 'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'
      : 'bg-[#252429] border-white/10 shadow-xl'
    : useBlur
      ? 'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'
      : 'bg-white border-gray-200 shadow-md'

  const hover = hoverEffect
    ? isDarkMode
      ? useBlur
        ? 'hover:-translate-y-1 hover:bg-[#252429]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)] active:translate-y-0 active:bg-[#252429]/60'
        : 'hover:-translate-y-1 hover:bg-[#2a2930] hover:shadow-lg active:translate-y-0 active:bg-[#252429]'
      : useBlur
        ? 'hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] active:translate-y-0 active:bg-white/90'
        : 'hover:-translate-y-1 hover:bg-gray-50 hover:shadow-lg active:translate-y-0 active:bg-white'
    : ''

  return { base, hover }
}

export const getModalGlass = (isDarkMode, useBlur = true) => isDarkMode
  ? useBlur
    ? 'bg-[#252429]/80 backdrop-blur-3xl border border-white/20 border-t-white/30 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
    : 'bg-[#252429] border border-white/15 shadow-2xl'
  : useBlur
    ? 'bg-white/80 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'
    : 'bg-white border border-gray-200 shadow-2xl'

export const getDropdownGlass = (isDarkMode, useBlur = true) => isDarkMode
  ? useBlur
    ? 'bg-[#252429]/95 backdrop-blur-3xl border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)]'
    : 'bg-[#252429] border border-white/15 shadow-xl'
  : useBlur
    ? 'bg-white/95 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_rgba(0,0,0,0.15)]'
    : 'bg-white border border-gray-200 shadow-xl'
