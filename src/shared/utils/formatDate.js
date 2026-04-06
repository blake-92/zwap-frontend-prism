/**
 * formatDate — normaliza la presentación de fechas.
 * Actualmente los mocks ya vienen formateados; esta función es el punto
 * único al que migrar cuando lleguen fechas ISO del backend.
 *
 * @param {string|Date} value  Fecha a formatear
 * @param {string}      locale Locale (default 'es-BO')
 */
export function formatDate(value, locale = 'es-BO') {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date)) return String(value) // passthrough para strings de mock
  return date.toLocaleDateString(locale, {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}
