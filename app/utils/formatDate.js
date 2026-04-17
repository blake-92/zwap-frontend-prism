/**
 * Formatea una fecha ISO (YYYY-MM-DD) o ISO con hora (YYYY-MM-DDTHH:mm) según el locale.
 * Devuelve string amigable: "29 mar 2026" en es-MX, "Mar 29, 2026" en en-US.
 *
 * @param {string|Date|null|undefined} input
 * @param {string} locale — 'es' | 'en' (o BCP-47 completo)
 * @param {object} [options] — override de Intl.DateTimeFormat
 * @returns {string}
 */
export function formatDate(input, locale = 'es', options) {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const tag = localeToBcp47(locale)
  return new Intl.DateTimeFormat(tag, options ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

/**
 * Versión corta: "29 mar" / "Mar 29" (sin año).
 */
export function formatDateShort(input, locale = 'es') {
  return formatDate(input, locale, { day: '2-digit', month: 'short' })
}

/**
 * Devuelve un objeto Date a partir de un string ISO "YYYY-MM-DD".
 * Usa componentes locales (no UTC) para evitar desfase de timezone.
 */
export function parseIsoDate(iso) {
  if (!iso || typeof iso !== 'string') return null
  const parts = iso.split('T')[0].split('-')
  if (parts.length !== 3) return null
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m, d)
}

function localeToBcp47(locale) {
  if (!locale) return 'es'
  if (locale === 'es') return 'es'
  if (locale === 'en') return 'en-US'
  return locale
}
