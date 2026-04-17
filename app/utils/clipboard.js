// Copia texto al portapapeles con manejo de error.
// Retorna true si tuvo éxito, false si falló (API no disponible, permiso denegado, insecure context).
export async function copyToClipboard(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
