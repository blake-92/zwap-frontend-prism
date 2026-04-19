/**
 * motion-v devuelve la instancia del componente (con `.$el` al DOM real) cuando
 * se usa `ref` sobre `<motion.div>`. En componentes plain Vue el ref apunta al DOM.
 * Este helper cubre ambos casos.
 */
export const getEl = (r) => r?.$el ?? r
