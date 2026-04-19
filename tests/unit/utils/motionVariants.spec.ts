import { describe, it, expect } from 'vitest'
import {
  listVariants, itemVariants, cardItemVariants, pageVariants,
  listVariantsInstant, itemVariantsInstant, cardItemVariantsInstant, pageVariantsInstant,
} from '~/utils/motionVariants'

describe('motion variants', () => {
  describe('spring variants (default)', () => {
    it('listVariants hace fade + stagger', () => {
      expect(listVariants.hidden.opacity).toBe(0)
      expect(listVariants.show.opacity).toBe(1)
      expect(listVariants.show.transition?.staggerChildren).toBeGreaterThan(0)
    })

    it('itemVariants hace slide horizontal (x: -10 → 0) con spring', () => {
      expect(itemVariants.hidden.x).toBe(-10)
      expect(itemVariants.show.x).toBe(0)
      expect(itemVariants.show.transition?.type).toBe('spring')
    })

    it('cardItemVariants hace slide vertical (y: 15 → 0) con spring', () => {
      expect(cardItemVariants.hidden.y).toBe(15)
      expect(cardItemVariants.show.y).toBe(0)
      expect(cardItemVariants.show.transition?.type).toBe('spring')
    })

    it('pageVariants tiene exit definido con duration corta', () => {
      expect(pageVariants.exit).toBeDefined()
      expect(pageVariants.exit?.transition?.duration).toBeDefined()
    })
  })

  describe('instant variants (duration 0)', () => {
    it('listVariantsInstant: hidden y show ambos opacity=1 (sin fade)', () => {
      expect(listVariantsInstant.hidden.opacity).toBe(1)
      expect(listVariantsInstant.show.opacity).toBe(1)
    })

    it('itemVariantsInstant: x=0 en ambos estados', () => {
      expect(itemVariantsInstant.hidden.x).toBe(0)
      expect(itemVariantsInstant.show.x).toBe(0)
    })

    it('cardItemVariantsInstant: y=0 en ambos', () => {
      expect(cardItemVariantsInstant.hidden.y).toBe(0)
      expect(cardItemVariantsInstant.show.y).toBe(0)
    })

    it('pageVariantsInstant tiene exit definido', () => {
      expect(pageVariantsInstant.exit).toBeDefined()
    })
  })
})
