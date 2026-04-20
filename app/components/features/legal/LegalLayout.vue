<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useMotionVariants } from '~/composables/useMotionVariants'
import LegalHeader from './LegalHeader.vue'
import LegalTocBar from './LegalTocBar.vue'
import LegalLanguageBanner from './LegalLanguageBanner.vue'
import LegalFooter from './LegalFooter.vue'

const props = defineProps({
  title: { type: String, required: true },
  titleLine2: { type: String, default: '' },
  badge: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  updatedDate: { type: String, required: true },
  tocItems: { type: Array, required: true },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const { t, locale } = useI18n()
const mv = useMotionVariants()

const isEnglish = computed(() => locale.value === 'en')

const mainBg = computed(() =>
  themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F8F7FB]',
)
const mainText = computed(() =>
  themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]',
)
</script>

<template>
  <div :class="['min-h-screen flex flex-col', mainBg, mainText]">
    <LegalHeader
      :title="title"
      :title-line2="titleLine2"
      :badge="badge"
      :effective-date-label="t('legal.effectiveDate')"
      :effective-date="effectiveDate"
      :updated-label="t('legal.lastUpdated')"
      :updated-date="updatedDate"
      :entity-label="t('legal.entityLabel')"
    />

    <LegalTocBar :items="tocItems" />

    <motion.main
      :variants="mv.page.value"
      initial="hidden"
      animate="show"
      class="flex-1 w-full max-w-[860px] mx-auto px-5 sm:px-8 pt-10 pb-20"
    >
      <LegalLanguageBanner v-if="isEnglish" class="mb-8" />
      <slot />
    </motion.main>

    <LegalFooter
      :entity="t('legal.footerEntity')"
      :copyright="t('legal.footerCopyright')"
      :back-to-top-label="t('legal.backToTop')"
    />
  </div>
</template>
