/**
 * Variantes de animación compartidas para framer-motion.
 * Usadas en todas las vistas con tablas y grids de cards.
 */

/** Wrapper de lista — aplica stagger a los hijos */
export const listVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
}

/** Ítem de tabla — slide desde la izquierda con spring */
export const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

/** Ítem de card/grid — aparece desde abajo con spring */
export const cardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

/** Page entry — usado como wrapper en todas las vistas (reemplaza ease boilerplate) */
export const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
}
