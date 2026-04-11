/**
 * formatCurrency — formats a numeric value as USD currency string.
 *
 * @param {number} value       — the amount to format
 * @param {object} [options]
 * @param {boolean} [options.showSign=false]  — prefix with + for positive values
 * @param {boolean} [options.abs=false]       — use absolute value
 * @param {number}  [options.decimals=2]      — fraction digits
 * @returns {string} e.g. "$1,234.56", "-$50.00", "+$12.00"
 */
export function formatCurrency(value, { showSign = false, abs = false, decimals = 2 } = {}) {
  const num = abs ? Math.abs(value) : value
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const sign = num < 0 ? '-' : showSign ? '+' : ''
  return `${sign}$${formatted}`
}
