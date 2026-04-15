<script setup>
import { computed, useAttrs } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { getCardClasses } from '~/utils/cardClasses'

const props = defineProps({
  hoverEffect: { type: Boolean, default: false },
})

const themeStore = useThemeStore()
const attrs = useAttrs()
const cls = computed(() => getCardClasses(themeStore.isDarkMode, props.hoverEffect))
const clickable = computed(() => typeof attrs.onClick === 'function')

const onKey = (e) => {
  if (!clickable.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (typeof attrs.onClick === 'function') attrs.onClick(e)
  }
}
</script>

<template>
  <div
    :class="[
      'rounded-[24px] border transition-all duration-300 transform-gpu overflow-hidden',
      cls.base,
      cls.hover,
      clickable ? 'cursor-pointer' : '',
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @keydown="onKey"
  >
    <slot />
  </div>
</template>
