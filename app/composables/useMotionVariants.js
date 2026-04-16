import { computed } from 'vue'
import { usePerformanceStore } from '~/stores/performance'
import {
  listVariants, itemVariants, cardItemVariants, pageVariants,
  listVariantsInstant, itemVariantsInstant, cardItemVariantsInstant, pageVariantsInstant,
} from '~/utils/motionVariants'

export function useMotionVariants() {
  const perfStore = usePerformanceStore()

  return {
    list: computed(() => perfStore.useSpring ? listVariants : listVariantsInstant),
    item: computed(() => perfStore.useSpring ? itemVariants : itemVariantsInstant),
    cardItem: computed(() => perfStore.useSpring ? cardItemVariants : cardItemVariantsInstant),
    page: computed(() => perfStore.useSpring ? pageVariants : pageVariantsInstant),
  }
}
