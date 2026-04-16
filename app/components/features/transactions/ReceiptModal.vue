<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { motion } from 'motion-v'
import { X, Printer, ArrowRightLeft, CheckCircle2, Download } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useScrollLock } from '~/composables/useScrollLock'
import { useChromeBlur } from '~/composables/useChromeBlur'
import { SPRING_SOFT } from '~/utils/springs'
import { BUSINESS_NAME } from '~/utils/mockData'

const props = defineProps({
  trx: { type: Object, required: true },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()

useScrollLock(true)
useChromeBlur(true)

const onKey = (e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => { if (typeof document !== 'undefined') document.addEventListener('keydown', onKey) })
onUnmounted(() => { if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey) })

const cardClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/90 border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]'
    : 'bg-white/90 border-white shadow-[0_30px_80px_rgba(124,58,237,0.15)]',
)
const iconBubbleClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
    : 'bg-gradient-to-tr from-[#7C3AED] to-[#B9A4F8] text-white shadow-[0_10px_20px_rgba(124,58,237,0.3)]',
)
const actionBtnClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/80 border border-white/10 text-white hover:bg-white/10'
    : 'bg-white border border-[#7C3AED]/20 text-[#561BAF] hover:bg-gray-50',
)
const closeBtnClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
    : 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100',
)

const statusBadgeClass = computed(() => {
  const variant = props.trx?.statusVariant
  const d = themeStore.isDarkMode
  if (variant === 'success') return d ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  if (variant === 'danger') return d ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-rose-100 text-rose-700 border border-rose-200'
  return d ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200'
})

const amountClass = computed(() => {
  if (props.trx?.statusVariant === 'danger') return 'text-rose-500 line-through opacity-70'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <motion.div
        role="dialog"
        aria-modal="true"
        :aria-label="t('transactions.paymentReceipt')"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.15 }"
          :class="['absolute inset-0 backdrop-blur-md', themeStore.isDarkMode ? 'bg-[#111113]/80' : 'bg-white/60']"
          @click="emit('close')"
        />

        <motion.div
          :initial="{ opacity: 0, y: 20, scale: 0.95 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95, y: 20 }"
          :transition="{ opacity: { duration: 0.15 }, y: SPRING_SOFT, scale: SPRING_SOFT }"
          class="relative w-full max-w-[400px]"
        >
          <div class="absolute -top-12 right-0 flex gap-2">
            <button :class="['p-2 rounded-full backdrop-blur-xl transition-colors shadow-lg', actionBtnClass]" :title="t('common.print')">
              <Printer :size="18" />
            </button>
            <button :class="['p-2 rounded-full backdrop-blur-xl transition-colors shadow-lg', actionBtnClass]" :title="t('common.downloadPdf')">
              <Download :size="18" />
            </button>
            <button :class="['p-2 rounded-full backdrop-blur-xl transition-colors shadow-lg', closeBtnClass]" :title="t('common.close')" @click="emit('close')">
              <X :size="18" />
            </button>
          </div>

          <div :class="['overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl', cardClass]">
            <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#7C3AED]/20 to-transparent pointer-events-none" />

            <div class="px-8 pt-10 pb-8 relative z-10">
              <div :class="['w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg', iconBubbleClass]">
                <ArrowRightLeft :size="28" :stroke-width="2" />
              </div>

              <div class="text-center mb-8">
                <h2 :class="['text-xl font-bold mb-1 tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ BUSINESS_NAME }}</h2>
                <p :class="['text-xs font-medium uppercase tracking-widest', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.paymentReceipt') }}</p>
              </div>

              <div class="flex justify-center mb-8">
                <div :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold', statusBadgeClass]">
                  <CheckCircle2 :size="14" />
                  {{ trx.status.toUpperCase() }}
                </div>
              </div>

              <div :class="['border-t border-dashed my-6', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-200']" />

              <div class="text-center my-6">
                <p :class="['text-xs font-bold tracking-widest uppercase mb-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.totalAmount') }}</p>
                <div :class="['text-4xl font-mono font-bold tracking-tighter', amountClass]">
                  ${{ trx.amount }} <span class="text-lg text-[#888991] font-sans">{{ t('common.usd') }}</span>
                </div>
              </div>

              <div :class="['border-t border-dashed my-6', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-200']" />

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.dateTime') }}</span>
                  <span :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ trx.date }}, {{ trx.time }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.transactionId') }}</span>
                  <span :class="['text-sm font-mono font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ trx.id }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.paymentMethod') }}</span>
                  <span :class="['text-sm font-bold flex items-center gap-1.5', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
                    <span class="capitalize">{{ trx.card || t('transactions.card') }}</span> •••• {{ trx.last4 }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('transactions.tableClient') }}</span>
                  <div class="flex flex-col items-end min-w-0 ml-4">
                    <span :class="['text-sm font-bold truncate max-w-full', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ trx.client || t('common.anonymousClient') }}</span>
                    <span v-if="trx.email" :class="['text-[11px] font-medium truncate max-w-full', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ trx.email }}</span>
                  </div>
                </div>
              </div>

              <div :class="['mt-8 pt-6 border-t border-dashed text-center', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-200']">
                <p :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ t('transactions.processedBy') }} <span :class="['font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">Zwap</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Teleport>
  </ClientOnly>
</template>
