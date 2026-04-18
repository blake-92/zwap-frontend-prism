// Stack global de modales — coordina Escape/Tab trap, solo el "top" responde (evita que padres capturen cuando hay hijo abierto).
const stack = []

if (import.meta.hot) import.meta.hot.dispose(() => { stack.length = 0 })

export function pushModal(id) {
  stack.push(id)
}

export function popModal(id) {
  const idx = stack.lastIndexOf(id)
  if (idx !== -1) stack.splice(idx, 1)
}

export function isTopModal(id) {
  return stack.length > 0 && stack[stack.length - 1] === id
}
