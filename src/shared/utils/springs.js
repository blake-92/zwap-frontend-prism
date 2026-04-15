/**
 * Spring constants centralizados para framer-motion.
 * Importar desde aquí en vez de definir SPRING local en cada componente.
 */

/** Default — interacciones de UI, dropdowns, modales, botones */
export const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

/** Sidebar collapse/expand — critically damped, sin rebote */
export const SPRING_SIDEBAR = { type: 'spring', stiffness: 380, damping: 42 }

/** Stagger items — más suave, para entradas de lista */
export const SPRING_SOFT = { type: 'spring', stiffness: 300, damping: 24 }

/** Pill dots indicator — snap rápido, para dots de swipeable cards */
export const SPRING_DOTS = { type: 'spring', stiffness: 420, damping: 32 }
