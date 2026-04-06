/**
 * formatCurrency — formatea un número como moneda.
 * Reemplaza todos los `$${amount}` manuales del proyecto.
 *
 * @param {number} amount   Valor numérico
 * @param {string} currency Código ISO (default 'USD')
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
