import { describe, it, expect, beforeEach } from 'vitest'
import { pushModal, popModal, isTopModal } from '~/utils/modalStack'

// El stack es un módulo-singleton. Limpiamos entre tests usando popModal para no
// contaminar: asumir stack vacío al arrancar el primer test y dejarlo vacío al terminar.
describe('modalStack', () => {
  const ids: symbol[] = []

  beforeEach(() => {
    // Limpieza defensiva: pop cualquier id que hayamos pushed.
    while (ids.length) popModal(ids.pop()!)
  })

  const trackPush = (id: symbol) => {
    pushModal(id)
    ids.push(id)
  }

  it('stack vacío: nada es top', () => {
    const id = Symbol('m1')
    expect(isTopModal(id)).toBe(false)
  })

  it('un solo modal: es top', () => {
    const id = Symbol('m1')
    trackPush(id)
    expect(isTopModal(id)).toBe(true)
  })

  it('dos modales: solo el último es top', () => {
    const a = Symbol('a')
    const b = Symbol('b')
    trackPush(a)
    trackPush(b)
    expect(isTopModal(a)).toBe(false)
    expect(isTopModal(b)).toBe(true)
  })

  it('pop del top restaura el anterior', () => {
    const a = Symbol('a')
    const b = Symbol('b')
    trackPush(a)
    trackPush(b)
    popModal(b)
    // lo quitamos del tracker también para no pop 2 veces
    ids.splice(ids.indexOf(b), 1)
    expect(isTopModal(a)).toBe(true)
    expect(isTopModal(b)).toBe(false)
  })

  it('pop de un id que no es top aún lo remueve (no rompe stack)', () => {
    const a = Symbol('a')
    const b = Symbol('b')
    trackPush(a)
    trackPush(b)
    popModal(a)
    ids.splice(ids.indexOf(a), 1)
    expect(isTopModal(b)).toBe(true)
    expect(isTopModal(a)).toBe(false)
  })

  it('pop de un id que no está en el stack es no-op', () => {
    const a = Symbol('a')
    const fantasma = Symbol('ghost')
    trackPush(a)
    expect(() => popModal(fantasma)).not.toThrow()
    expect(isTopModal(a)).toBe(true)
  })

  it('mismo id pushed 2 veces → pop remueve solo la última ocurrencia', () => {
    const a = Symbol('a')
    trackPush(a)
    trackPush(a)
    expect(isTopModal(a)).toBe(true)
    popModal(a)
    ids.splice(ids.lastIndexOf(a), 1)
    expect(isTopModal(a)).toBe(true) // aún queda 1 instancia
  })
})
