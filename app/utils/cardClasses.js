/**
 * Glass/card class builders — aceptan flags del performance tier.
 * Los componentes pasan desde perfStore: useBlur, useNeon, modalShadow, useGlassElevation.
 *
 * Glass elevation (solo Prism) — liquid glass real:
 *   - Opacidad reducida (cristal se siente "transparente")
 *   - backdrop-saturate-150 → lo que está detrás se ve más vibrante a través del cristal
 *   - Rim borders definen edges (top + left)
 *   - Inset 1px top highlight (luz en el edge, no overlay)
 *   - Dual-source drop shadow (dimensión 3D)
 *
 * Trade-off: en Prism la saturación backdrop se permite (hardware flagship).
 * En Normal/Lite se queda con glass base (más opaco, sin saturate) para ahorrar GPU.
 */

/**
 * Clase para table thead — compartida entre 6 vistas con tablas.
 * En Lite light el `bg-white/50` desaparece sobre cards blancas — usamos tinte lavanda.
 */
export function getTheadClass(isDarkMode, isLite = false) {
  if (isDarkMode) {
    if (isLite) return 'text-[#888991] border-b border-white/10 bg-[#1A1A1D]'
    return 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
  }
  if (isLite) return 'text-[#67656E] border-b border-[#DBD3FB] bg-[#F8F7FB]'
  return 'text-[#67656E] border-b border-black/5 bg-white/50'
}

export function getCardClasses(isDarkMode, hoverEffect = false, useBlur = true, useNeon = true, useGlassElevation = false) {
  const d = isDarkMode
  let base

  if (!useBlur) {
    // Lite tier — surfaces sin glass. Para no perder identidad ni jerarquía:
    //   Dark:  tinte layered (#1A1A1D sobre #111113) + rim inset + shadow tight
    //   Light: bg blanco + border lavanda de marca + shadow dual branded púrpura
    base = d
      ? 'bg-[#1A1A1D] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.5)]'
      : 'bg-white border border-[#DBD3FB] shadow-[0_1px_2px_rgba(124,58,237,0.05),0_4px_12px_rgba(124,58,237,0.06)]'
  } else if (useGlassElevation) {
    // Prism — liquid glass: opacidad baja + backdrop-saturate + rim + bevel
    const shadow = d
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_32px_rgba(0,0,0,0.35)]'
      : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_30px_rgba(0,0,0,0.06)]'
    base = d
      ? `bg-[#252429]/20 backdrop-blur-2xl backdrop-saturate-150 border-white/12 border-t-white/25 border-l-white/10 ${shadow}`
      : `bg-white/30 backdrop-blur-2xl backdrop-saturate-150 border-white/70 border-t-white border-l-white/60 ${shadow}`
  } else {
    // Normal — glass base sin elevation (más opaco, más económico)
    base = d
      ? 'bg-[#252429]/30 backdrop-blur-2xl border-white/10 border-t-white/20 shadow-2xl'
      : 'bg-white/40 backdrop-blur-2xl border-white border-t-white shadow-[0_10px_40px_rgb(0,0,0,0.05)]'
  }

  // Hover shadow: neon en Prism, plano en Normal/Lite
  const hoverShadowDark = useNeon
    ? 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]'
    : 'hover:shadow-2xl'
  const hoverShadowLight = useNeon
    ? 'hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
    : 'hover:shadow-xl'

  // Hover bg también más transparente en Prism elevation
  const hoverBgDark = useGlassElevation ? 'hover:bg-[#252429]/35' : 'hover:bg-[#252429]/50'
  const hoverBgLight = useGlassElevation ? 'hover:bg-white/50' : 'hover:bg-white/80'
  const activeBgDark = useGlassElevation ? 'active:bg-[#252429]/45' : 'active:bg-[#252429]/60'
  const activeBgLight = useGlassElevation ? 'active:bg-white/60' : 'active:bg-white/90'

  const hover = hoverEffect
    ? d
      ? useBlur
        ? `hover:-translate-y-1 ${hoverBgDark} ${hoverShadowDark} active:translate-y-0 ${activeBgDark}`
        : 'active:scale-[0.98] active:bg-[#7C3AED]/20 transition-all duration-100'
      : useBlur
        ? `hover:-translate-y-1 ${hoverBgLight} ${hoverShadowLight} active:translate-y-0 ${activeBgLight}`
        : 'active:scale-[0.98] active:bg-[#7C3AED]/10 transition-all duration-100'
    : ''

  return { base, hover }
}

export const getModalGlass = (isDarkMode, useBlur = true, shadowLevel = 'deep', useGlassElevation = false) => {
  const d = isDarkMode
  if (!useBlur) {
    // Lite modal — branded depth sin glass. Modal shadow stronger que Card (hierarchy).
    return d
      ? 'bg-[#1A1A1D] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.6)]'
      : 'bg-white border border-[#DBD3FB] shadow-[0_4px_12px_rgba(124,58,237,0.08),0_16px_40px_rgba(124,58,237,0.08)]'
  }

  if (useGlassElevation) {
    // Prism — liquid glass modal: más transparente + saturate + rim + cinematic shadow
    const rim = d ? 'border-t-white/25 border-l-white/10' : 'border-t-white border-l-white/60'
    const shadow = d
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_80px_rgba(0,0,0,0.9)]'
      : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_40px_80px_rgba(0,0,0,0.15)]'
    return d
      ? `bg-[#252429]/65 backdrop-blur-3xl backdrop-saturate-150 border border-white/20 ${rim} ${shadow}`
      : `bg-white/70 backdrop-blur-3xl backdrop-saturate-150 border border-white/70 ${rim} ${shadow}`
  }

  // Normal/Lite — sin elevation
  const bg = d ? 'bg-[#252429]/80' : 'bg-white/80'
  const borderBase = d ? 'border border-white/20' : 'border border-white/80'
  const shadowMap = {
    deep:    d ? 'shadow-[0_40px_80px_rgba(0,0,0,0.9)]'  : 'shadow-[0_40px_80px_rgba(0,0,0,0.15)]',
    medium:  d ? 'shadow-[0_20px_50px_rgba(0,0,0,0.75)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
    compact: 'shadow-2xl',
  }
  const shadow = shadowMap[shadowLevel] || shadowMap.deep
  return `${bg} backdrop-blur-3xl ${borderBase} ${shadow}`
}

export const getDropdownGlass = (isDarkMode, useBlur = true, shadowLevel = 'deep', useGlassElevation = false) => {
  const d = isDarkMode
  if (!useBlur) {
    // Lite dropdown — branded depth. Entre Card y Modal en peso.
    return d
      ? 'bg-[#1A1A1D] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.6)]'
      : 'bg-white border border-[#DBD3FB] shadow-[0_2px_8px_rgba(124,58,237,0.08),0_10px_30px_rgba(124,58,237,0.08)]'
  }

  if (useGlassElevation) {
    // Dropdown mantiene más opacidad (readability de options prioridad) pero gana saturate
    const rim = d ? 'border-t-white/25 border-l-white/10' : 'border-t-white border-l-white/60'
    const shadow = d
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_40px_80px_rgba(0,0,0,0.9)]'
      : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_40px_80px_rgba(0,0,0,0.15)]'
    return d
      ? `bg-[#252429]/85 backdrop-blur-3xl backdrop-saturate-150 border border-white/20 ${rim} ${shadow}`
      : `bg-white/85 backdrop-blur-3xl backdrop-saturate-150 border border-white/70 ${rim} ${shadow}`
  }

  const bg = d ? 'bg-[#252429]/95' : 'bg-white/95'
  const borderBase = d ? 'border border-white/20' : 'border border-white/80'
  const shadowMap = {
    deep:    d ? 'shadow-[0_40px_80px_rgba(0,0,0,0.9)]'  : 'shadow-[0_40px_80px_rgba(0,0,0,0.15)]',
    medium:  d ? 'shadow-[0_20px_40px_rgba(0,0,0,0.65)]' : 'shadow-[0_15px_35px_rgba(0,0,0,0.08)]',
    compact: 'shadow-xl',
  }
  const shadow = shadowMap[shadowLevel] || shadowMap.deep
  return `${bg} backdrop-blur-3xl ${borderBase} ${shadow}`
}
