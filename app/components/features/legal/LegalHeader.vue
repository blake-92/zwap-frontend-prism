<script setup>
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import ZwapLogo from '~/components/brand/ZwapLogo.vue'
import Button from '~/components/ui/Button.vue'

const props = defineProps({
  title: { type: String, required: true },
  titleLine2: { type: String, default: '' },
  badge: { type: String, required: true },
  effectiveDateLabel: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  updatedLabel: { type: String, required: true },
  updatedDate: { type: String, required: true },
  entityLabel: { type: String, required: true },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const { t } = useI18n()

// Theme-aware surfaces (bi-tonal).
const headerBg = computed(() =>
  themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F8F7FB]',
)
const headerText = computed(() =>
  themeStore.isDarkMode ? 'text-white' : 'text-[#111113]',
)
const metaText = computed(() =>
  themeStore.isDarkMode ? 'text-white/60' : 'text-[#67656E]',
)
const badgeClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/20 border-[#7C3AED]/35 text-[#A78BFA]'
    : 'bg-[#7C3AED]/12 border-[#7C3AED]/30 text-[#7C3AED]',
)
const accentText = computed(() =>
  themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
)

// Radial gradient atmosphere — pintado (cero GPU extra). Intensidades suaves en light.
const glowTopRight = computed(() => {
  const d = themeStore.isDarkMode
  const primary = d
    ? (perfStore.isFull ? 0.22 : perfStore.isNormal ? 0.18 : 0.14)
    : (perfStore.isFull ? 0.08 : perfStore.isNormal ? 0.06 : 0.04)
  const secondary = d
    ? (perfStore.isFull ? 0.10 : perfStore.isNormal ? 0.08 : 0.06)
    : (perfStore.isFull ? 0.04 : perfStore.isNormal ? 0.03 : 0.02)
  return `radial-gradient(circle at 85% -10%, rgba(124, 58, 237, ${primary}) 0%, rgba(167, 139, 250, ${secondary}) 40%, transparent 70%)`
})
const glowBottomLeft = computed(() => {
  const d = themeStore.isDarkMode
  const intensity = d
    ? (perfStore.isFull ? 0.12 : perfStore.isNormal ? 0.09 : 0.06)
    : (perfStore.isFull ? 0.05 : perfStore.isNormal ? 0.04 : 0.03)
  return `radial-gradient(circle at -10% 110%, rgba(167, 139, 250, ${intensity}) 0%, transparent 60%)`
})

// Soft branded border-bottom — separa el header del TOC en light sin escalón duro.
const bottomRim = computed(() =>
  themeStore.isDarkMode ? '' : 'border-b border-[#DBD3FB]',
)
</script>

<template>
  <header
    :class="[
      'relative overflow-hidden px-5 sm:px-8 pt-14 pb-12',
      headerBg,
      headerText,
      bottomRim,
    ]"
  >
    <!-- Decorative radial glows (painted, no blur) -->
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{ background: glowTopRight }"
    />
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{ background: glowBottomLeft }"
    />

    <!-- Theme toggle — top-right, above decor layers -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
      <Button
        variant="ghost"
        size="icon"
        :title="t('header.themeToggle')"
        @click="themeStore.toggleTheme()"
      >
        <component :is="themeStore.isDarkMode ? Sun : Moon" :size="18" />
      </Button>
    </div>

    <div class="relative z-10 max-w-[860px] mx-auto">
      <!-- Logo row -->
      <div class="flex items-center gap-3 mb-7">
        <ZwapLogo wrapper-class="h-8" />
      </div>

      <!-- Badge -->
      <span
        :class="[
          'inline-block text-[11px] font-bold uppercase tracking-[0.14em] border px-3.5 py-1 rounded-full mb-5',
          badgeClass,
        ]"
      >
        {{ badge }}
      </span>

      <!-- Title -->
      <h1
        class="font-extrabold leading-[1.15] tracking-[-0.03em] mb-3.5"
        style="font-size: clamp(1.75rem, 4.5vw, 2.6rem)"
      >
        {{ title }}<template v-if="titleLine2"><br>{{ titleLine2 }}</template>
      </h1>

      <!-- Meta -->
      <div :class="['text-sm font-normal leading-[1.65] legal-header-meta', metaText]">
        <span v-html="entityLabel" /><br>
        {{ effectiveDateLabel }}:
        <strong :class="['font-semibold opacity-100', accentText]">{{ effectiveDate }}</strong>
        &nbsp;·&nbsp;
        {{ updatedLabel }}: {{ updatedDate }}
      </div>
    </div>
  </header>
</template>

<style scoped>
.legal-header-meta :deep(strong) {
  font-weight: 600;
}
</style>
