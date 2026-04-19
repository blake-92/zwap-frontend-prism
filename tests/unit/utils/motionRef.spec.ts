import { describe, it, expect } from 'vitest'
import { getEl } from '~/utils/motionRef'

describe('getEl — DOM resolver para refs motion-v vs plain', () => {
  it('ref motion-v (con .$el): devuelve el $el', () => {
    const div = document.createElement('div')
    const motionInstance = { $el: div }
    expect(getEl(motionInstance)).toBe(div)
  })

  it('ref plain DOM: devuelve el elemento tal cual', () => {
    const div = document.createElement('div')
    expect(getEl(div)).toBe(div)
  })

  it('null / undefined: devuelve falsy sin romper', () => {
    expect(getEl(null)).toBeNull()
    expect(getEl(undefined)).toBeUndefined()
  })

  it('objeto sin .$el: devuelve el objeto', () => {
    const obj = { foo: 'bar' }
    expect(getEl(obj)).toBe(obj)
  })
})
