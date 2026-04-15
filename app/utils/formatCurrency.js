export function formatCurrency(value, { showSign = false, abs = false, decimals = 2 } = {}) {
  const num = abs ? Math.abs(value) : value
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const sign = num < 0 ? '-' : showSign ? '+' : ''
  return `${sign}$${formatted}`
}
