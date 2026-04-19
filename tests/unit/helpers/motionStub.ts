import { h, defineComponent, type Component } from 'vue'

/**
 * Stub de motion-v: renderiza un wrapper simple con el tag dado, preserva slots,
 * $attrs, y eventos. Descarta props específicos de motion (initial, animate,
 * exit, transition, drag, whileHover, layoutId, etc.) que no son HTML válidos.
 *
 * Usado para neutralizar `repeat: Infinity` y otros loops que cuelgan timers.
 */
const MOTION_PROPS = [
  'initial', 'animate', 'exit', 'transition', 'variants', 'layout',
  'layoutId', 'layout-id', 'drag', 'dragConstraints', 'drag-constraints',
  'dragElastic', 'drag-elastic', 'dragSnapToOrigin', 'drag-snap-to-origin',
  'whileHover', 'while-hover', 'whileTap', 'while-tap', 'whileInView',
  'while-in-view', 'viewport', 'custom', 'onAnimationComplete', 'inherit',
  'reducedMotion',
]

const createMotionStub = (tag: string): Component => defineComponent({
  name: `MotionStub(${tag})`,
  inheritAttrs: false,
  setup(_, { slots, attrs, emit }) {
    return () => {
      // Filtrar props motion-v para no ensuciar el HTML
      const filteredAttrs: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(attrs)) {
        if (!MOTION_PROPS.includes(k)) filteredAttrs[k] = v
      }
      // drag-end → emit
      return h(tag, filteredAttrs, slots.default?.())
    }
  },
})

export const motionStub = {
  motion: new Proxy({}, {
    get: (_t, prop: string) => createMotionStub(prop),
  }),
  AnimatePresence: defineComponent({
    name: 'AnimatePresenceStub',
    setup(_, { slots }) {
      return () => slots.default?.()
    },
  }),
  LayoutGroup: defineComponent({
    name: 'LayoutGroupStub',
    setup(_, { slots }) {
      return () => slots.default?.()
    },
  }),
  useAnimationControls: () => ({
    start: async () => {},
    stop: () => {},
    set: () => {},
  }),
}
