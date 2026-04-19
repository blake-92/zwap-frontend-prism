import { parseIsoDate } from '~/utils/formatDate'

/**
 * Matcher compartido para filtros de rango de fecha.
 *
 * Cada vista usa un subset distinto (Transacciones/Wallet: today/last7/thisMonth;
 * Liquidaciones: thisWeek/thisMonth). `useI18n()` se recibe inyectado porque este
 * composable no accede al store de i18n directamente — el caller le pasa la `t` ya
 * lista para evitar re-renders extras.
 *
 * @param {Function} t   Función de i18n
 * @returns {{ match: (iso: string, dateFilterValue: string, defaultValue: string) => boolean }}
 */
export function useDateRangeMatcher(t) {
  const labels = {
    today: () => t('filters.today'),
    last7: () => t('filters.last7days'),
    thisWeek: () => t('filters.thisWeek'),
    thisMonth: () => t('filters.thisMonth'),
  }

  const match = (iso, dateFilterValue, defaultValue) => {
    if (dateFilterValue === defaultValue) return true
    const date = parseIsoDate(iso)
    if (!date) return false
    const today = new Date()

    if (dateFilterValue === labels.today()) {
      return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate()
    }
    if (dateFilterValue === labels.last7() || dateFilterValue === labels.thisWeek()) {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      return date >= weekAgo && date <= today
    }
    if (dateFilterValue === labels.thisMonth()) {
      return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
    }
    return true
  }

  return { match }
}
