<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'

defineProps({
  id: { type: String, required: true },
  num: { type: String, required: true },
  title: { type: String, required: true },
})

const themeStore = useThemeStore()

const headingColor = computed(() =>
  themeStore.isDarkMode ? 'text-white' : 'text-[#111113]',
)
const borderColor = computed(() =>
  themeStore.isDarkMode ? 'border-white/10' : 'border-[#E5E2EE]',
)
</script>

<template>
  <section
    :id="id"
    class="mb-12 scroll-mt-16 legal-section"
  >
    <h2
      :class="[
        'text-[1.4rem] font-extrabold tracking-[-0.025em] mb-4 pb-2.5 border-b-2 flex items-center gap-2.5',
        headingColor,
        borderColor,
      ]"
    >
      <span
        class="inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white text-[11.5px] font-extrabold flex-shrink-0"
      >
        {{ num }}
      </span>
      <span>{{ title }}</span>
    </h2>
    <slot />
  </section>
</template>

<style scoped>
.legal-section :deep(h3) {
  font-size: 0.98rem;
  font-weight: 700;
  margin: 1.5rem 0 0.55rem;
}
.legal-section :deep(p) {
  margin-bottom: 0.9rem;
  font-size: 0.92rem;
  line-height: 1.75;
}
.legal-section :deep(strong) {
  font-weight: 700;
}
</style>
