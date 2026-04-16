<script setup>
import { ref, computed } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import InfoBanner from '~/components/ui/InfoBanner.vue'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  trx: { type: Object, required: true },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()

const refundType = ref('total')
const feeBearer = ref('hotel')
const partial = ref('')

const refundAmount = computed(() => refundType.value === 'parcial' ? (partial.value || '0.00') : props.trx.amount)

const warningText = computed(() =>
  feeBearer.value === 'hotel'
    ? t('refund.hotelBearerDesc', { amount: refundAmount.value })
    : t('refund.clientBearerDesc', { amount: refundAmount.value }),
)

const options = computed(() => [
  { id: 'total', label: t('refund.total'), sub: `$${props.trx.amount}`, subColor: 'text-rose-500' },
  { id: 'parcial', label: t('refund.partial'), sub: t('refund.customAmount'), subColor: themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]' },
])

const feeBearerOpts = computed(() => [
  { value: 'hotel', label: t('refund.hotelBearerLabel') },
  { value: 'cliente', label: t('refund.clientBearerLabel') },
])

const boxClass = (id) => {
  const active = refundType.value === id
  const d = themeStore.isDarkMode
  if (active) {
    if (id === 'total') return d ? 'bg-rose-500/10 border-rose-500/50' : 'bg-rose-50 border-rose-400'
    return d ? 'bg-[#7C3AED]/10 border-[#7C3AED]/50' : 'bg-[#DBD3FB]/40 border-[#7C3AED]/40'
  }
  return d ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
}

const handlePartialInput = (e) => {
  const val = e.target.value
  const maxAmount = parseFloat(props.trx.amount.replace(/,/g, ''))
  if (val === '' || parseFloat(val) <= maxAmount) partial.value = val
}

const inputClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 placeholder-[#45434A]'
    : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-xs placeholder-gray-300',
)
</script>

<template>
  <Modal
    :title="t('refund.title')"
    :icon="RotateCcw"
    max-width="600px"
    @close="emit('close')"
  >
    <template #description>
      {{ t('refund.originalCharge') }}:
      <span :class="['font-mono', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ trx.amount }}</span>
      a {{ trx.client || t('common.anonymousClient') }}
    </template>

    <div class="p-5 sm:p-8 space-y-8">
      <div>
        <SectionLabel class="mb-4">{{ t('refund.type') }}</SectionLabel>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="opt in options"
            :key="opt.id"
            :class="['p-4 rounded-xl border cursor-pointer transition-all', boxClass(opt.id)]"
            @click="refundType = opt.id"
          >
            <div class="flex justify-between items-center mb-1">
              <span :class="['font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ opt.label }}</span>
              <div :class="[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                refundType === opt.id
                  ? (opt.id === 'total' ? 'border-rose-500' : 'border-[#7C3AED]')
                  : themeStore.isDarkMode ? 'border-[#45434A]' : 'border-gray-300'
              ]">
                <div
                  v-if="refundType === opt.id"
                  :class="['w-2 h-2 rounded-full', opt.id === 'total' ? 'bg-rose-500' : 'bg-[#7C3AED]']"
                />
              </div>
            </div>
            <p :class="['text-sm font-mono', opt.subColor]">{{ opt.sub }}</p>
          </div>
        </div>

        <div v-if="refundType === 'parcial'" class="mt-4 animate-fade-in relative">
          <span :class="['absolute left-4 top-3.5 font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">$</span>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            :max="parseFloat(trx.amount.replace(/,/g, ''))"
            :value="partial"
            :class="['w-full pl-8 pr-4 py-3 rounded-xl border outline-hidden font-mono font-bold text-lg transition-all', inputClass]"
            @input="handlePartialInput"
          />
        </div>
      </div>

      <div>
        <SectionLabel class="mb-4">{{ t('refund.feeBearer') }}</SectionLabel>
        <SegmentControl v-model="feeBearer" :options="feeBearerOpts" />
        <InfoBanner class="mt-4">{{ warningText }}</InfoBanner>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" @click="emit('close')">{{ t('common.cancel') }}</Button>
      <Button class="flex-1 !py-3.5 !bg-rose-500 hover:!bg-rose-600 !border-rose-400 !shadow-[0_8px_25px_rgba(244,63,94,0.3)]">
        <RotateCcw :size="18" /> {{ t('refund.processRefund') }}
      </Button>
    </template>
  </Modal>
</template>
