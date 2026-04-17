<script setup>
import { ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Plus } from 'lucide-vue-next'
import { useViewSearch } from '~/composables/useViewSearch'
import { useThemeStore } from '~/stores/theme'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { KPIS } from '~/utils/mockData'
import { ROUTES } from '~/utils/routes'
import Button from '~/components/ui/Button.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import KpiCard from './KpiCard.vue'
import QuickLinkCard from './QuickLinkCard.vue'
import ChartCard from './ChartCard.vue'
import LiveFeed from './LiveFeed.vue'
import PendingCharges from './PendingCharges.vue'
import NewLinkModal from '~/components/features/links/NewLinkModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
useViewSearch('')

const newLinkOpen = ref(false)
const activeTab = ref('operations')

const segmentOptions = computed(() => [
  { value: 'operations', label: t('dashboard.tabOperations') },
  { value: 'metrics', label: t('dashboard.tabMetrics') },
])

const goTransactions = () => navigateTo(ROUTES.TRANSACTIONS)
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
      <h1 :class="['text-xl sm:text-2xl font-bold tracking-tight hidden sm:block', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        {{ t('nav.dashboard') }}
      </h1>

      <div class="flex-1 sm:max-w-xs">
        <SegmentControl v-model="activeTab" :options="segmentOptions" layout-id="dashboardTab" />
      </div>

      <div class="hidden sm:block sm:ml-auto">
        <Button @click="newLinkOpen = true">
          <Plus :size="18" /> {{ t('dashboard.newReservationLink') }}
        </Button>
      </div>
    </div>

    <div class="sm:hidden mb-6">
      <Button size="lg" class="w-full" @click="newLinkOpen = true">
        <Plus :size="18" /> {{ t('dashboard.newReservationLink') }}
      </Button>
    </div>

    <template v-if="activeTab === 'operations'">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
        <QuickLinkCard />
        <LiveFeed @view-all="goTransactions" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:gap-6 2xl:gap-8">
        <PendingCharges />
      </div>
    </template>

    <template v-if="activeTab === 'metrics'">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8 mb-6 sm:mb-8">
        <KpiCard v-for="kpi in KPIS" :key="kpi.label" :kpi="kpi" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8">
        <ChartCard />
      </div>
    </template>

    <AnimatePresence>
      <NewLinkModal v-if="newLinkOpen" key="new-link" @close="newLinkOpen = false" />
    </AnimatePresence>
  </motion.div>
</template>
