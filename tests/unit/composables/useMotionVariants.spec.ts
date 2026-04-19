import { describe, it, expect } from 'vitest'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { usePerformanceStore } from '~/stores/performance'
import {
  listVariants, itemVariants, cardItemVariants, pageVariants,
} from '~/utils/motionVariants'
import { withSetup } from '../helpers/withSetup'

describe('useMotionVariants', () => {
  // Nota: `useSpring` en performance store es `() => true` por diseño — springs
  // son CPU-cheap y se mantienen en los 3 tiers. Los *Instant variants existen
  // en utils pero no se consumen vía este composable actualmente.

  it('Prism (full): devuelve variants con spring', () => {
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'full'
      return useMotionVariants()
    })
    expect(result.list.value).toBe(listVariants)
    expect(result.item.value).toBe(itemVariants)
    expect(result.cardItem.value).toBe(cardItemVariants)
    expect(result.page.value).toBe(pageVariants)
    unmount()
  })

  it('Normal: mantiene identidad Prism con springs (no downgrade)', () => {
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'normal'
      return useMotionVariants()
    })
    expect(result.list.value).toBe(listVariants)
    expect(result.item.value).toBe(itemVariants)
    unmount()
  })

  it('Lite: useSpring sigue true (spring es CPU-cheap) — mantiene springs', () => {
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'lite'
      return useMotionVariants()
    })
    expect(result.list.value).toBe(listVariants)
    expect(result.item.value).toBe(itemVariants)
    unmount()
  })

  it('retorna objetos con shape {list, item, cardItem, page}', () => {
    const { result, unmount } = withSetup(() => useMotionVariants())
    expect(result).toHaveProperty('list')
    expect(result).toHaveProperty('item')
    expect(result).toHaveProperty('cardItem')
    expect(result).toHaveProperty('page')
    // Cada uno es un ComputedRef
    expect(result.list.value.hidden).toBeDefined()
    expect(result.list.value.show).toBeDefined()
    unmount()
  })
})
