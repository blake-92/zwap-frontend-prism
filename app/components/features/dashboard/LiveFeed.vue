<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { ArrowRight, CreditCard } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { TRANSACTIONS } from '~/utils/mockData'
import { listVariants, itemVariants } from '~/utils/motionVariants'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import ReceiptModal from '~/components/features/transactions/ReceiptModal.vue'

const emit = defineEmits(['viewAll'])
const { t } = useI18n()
const themeStore = useThemeStore()
const receiptTrx = ref(null)

const recent = TRANSACTIONS.slice(0, 4)

const trClass = computed(() =>
  themeStore.isDarkMode
    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0',
)
const theadClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#888991] bg-[#111113]/20'
    : 'text-[#67656E] bg-white/20',
)

const amountClass = (trx) => {
  if (trx.status === 'Reembolsado') return 'text-rose-500 line-through opacity-70'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
}
const ringClass = (variant) => {
  if (variant === 'success') return 'bg-gradient-to-br from-emerald-400 to-emerald-600'
  if (variant === 'danger') return 'bg-gradient-to-br from-rose-400 to-rose-600'
  return 'bg-gradient-to-br from-amber-400 to-amber-600'
}
</script>

<template>
  <Card class="lg:col-span-2 pb-2 flex flex-col">
    <CardHeader :description="t('dashboard.liveFeedDesc')" wrapper-class="p-6 pb-5">
      <template #title>
        <motion.span
          :initial="{ opacity: 0.2 }"
          :animate="{ opacity: [1, 0.2, 1, 0.2, 1] }"
          :transition="{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 1 }"
          class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block"
        />
        {{ t('dashboard.liveFeed') }}
      </template>
      <Button variant="ghost" size="sm" class="!text-[#7C3AED] !h-8 !px-2" @click="emit('viewAll')">
        {{ t('dashboard.viewAll') }} <ArrowRight :size="14" class="ml-1" />
      </Button>
    </CardHeader>

    <!-- Desktop table -->
    <div class="overflow-x-auto flex-1 hidden lg:block">
      <table :aria-label="t('dashboard.liveFeed')" class="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
            <th class="px-6 py-3">{{ t('dashboard.tableTime') }}</th>
            <th class="px-4 py-3">{{ t('dashboard.tableOrigin') }}</th>
            <th class="px-4 py-3">{{ t('dashboard.tableChannel') }}</th>
            <th class="px-4 py-3 text-center">{{ t('dashboard.tableStatus') }}</th>
            <th class="px-6 py-3 text-right">{{ t('dashboard.tableAmount') }}</th>
          </tr>
        </thead>
        <motion.tbody :variants="listVariants" initial="hidden" animate="show">
          <motion.tr
            v-for="trx in recent"
            :key="trx.id"
            :variants="itemVariants"
            :class="['group transition-colors duration-200', trClass]"
          >
            <td class="px-6 py-3">
              <span :class="['text-xs font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]']">{{ trx.time }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gray-500/60 flex items-center justify-center flex-shrink-0">
                  <CreditCard :size="12" class="text-white/80" />
                </div>
                <div>
                  <span :class="['font-bold text-xs block', themeStore.isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]']">
                    {{ trx.client ? trx.client.split(' ')[0] : t('dashboard.counter') }}
                  </span>
                  <span :class="['flex items-center gap-1 text-[10px] font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <CreditCard :size="10" class="opacity-70" />
                    <span class="font-mono tracking-widest opacity-70">••</span>
                    <span class="font-mono">{{ trx.last4 }}</span>
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="['text-[11px] font-semibold flex items-center gap-1.5', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                <component :is="trx.ChannelIcon" :size="12" :class="themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'" />
                {{ trx.channel.includes('POS') ? 'POS' : 'Link' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <Badge :variant="trx.statusVariant" :icon="trx.StatusIcon" class="!py-0.5 !px-2 !text-[9px]">{{ trx.status }}</Badge>
            </td>
            <td class="px-6 py-3 text-right">
              <span :class="['font-mono font-bold text-sm tracking-tight', amountClass(trx)]">${{ trx.amount }}</span>
            </td>
          </motion.tr>
        </motion.tbody>
      </table>
    </div>

    <!-- Mobile ticker -->
    <div class="lg:hidden flex-1 px-4 pb-2 pt-1">
      <motion.div :variants="listVariants" initial="hidden" animate="show" class="space-y-0.5">
        <motion.div
          v-for="(trx, i) in recent"
          :key="trx.id"
          :variants="itemVariants"
          :class="[
            'flex items-center gap-2.5 py-2 cursor-pointer active:opacity-70 transition-opacity',
            i < 3 ? (themeStore.isDarkMode ? 'border-b border-white/5' : 'border-b border-black/5') : ''
          ]"
          @click="receiptTrx = trx"
        >
          <div :class="['relative flex-shrink-0 rounded-full p-[2px]', ringClass(trx.statusVariant)]">
            <div :class="['rounded-full p-[1.5px]', themeStore.isDarkMode ? 'bg-[#252429]' : 'bg-white']">
              <div class="w-7 h-7 rounded-full bg-gray-500/60 flex items-center justify-center flex-shrink-0">
                <CreditCard :size="12" class="text-white/80" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 min-w-0 flex-1 text-[11px]">
            <span :class="['font-bold truncate', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
              {{ trx.client ? trx.client.split(' ')[0] : t('dashboard.counter') }}
            </span>
            <span :class="['opacity-30', themeStore.isDarkMode ? 'text-white' : 'text-black']">·</span>
            <span :class="['text-[10px] flex-shrink-0', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ trx.time }}</span>
            <span :class="['opacity-30', themeStore.isDarkMode ? 'text-white' : 'text-black']">·</span>
            <component :is="trx.ChannelIcon" :size="10" :class="['flex-shrink-0', themeStore.isDarkMode ? 'text-[#7C3AED] opacity-70' : 'text-[#561BAF] opacity-60']" />
          </div>
          <span :class="['font-mono font-bold text-[13px] tracking-tight flex-shrink-0', amountClass(trx)]">${{ trx.amount }}</span>
        </motion.div>
      </motion.div>
    </div>
  </Card>

  <AnimatePresence>
    <ReceiptModal v-if="receiptTrx" :trx="receiptTrx" @close="receiptTrx = null" />
  </AnimatePresence>
</template>
