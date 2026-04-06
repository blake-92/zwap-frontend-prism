/**
 * cn — helper para combinar clases de Tailwind condicionalmente.
 * Alternativa liviana a clsx/classnames sin dependencias externas.
 *
 * @param {...(string|undefined|null|false)} classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
