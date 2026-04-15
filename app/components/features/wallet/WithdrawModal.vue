<script setup>
import { ref, computed } from 'vue'
import { ArrowUpFromLine, Landmark } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import InfoBanner from '~/components/ui/InfoBanner.vue'
import { useThemeStore } from '~/stores/theme'
import { WALLET_BALANCE, BANK_ACCOUNT } from '~/utils/mockData'

const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()

const amount = ref('')
const balance = WALLET_BALANCE.raw
const parsedAmt = computed(() => parseFloat((amount.value || '').replace(',', '.')) || 0)
const net = computed(() => parsedAmt.value)

const disabled = computed(() => parsedAmt.value <= 0 || parsedAmt.value > balance)
const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const surfaceClass = computed(() => themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-gray-50/60 border-gray-200')
</script>

<template>
  <Modal
    :title="t('wallet.withdrawTitle')"
    :icon="ArrowUpFromLine"
    max-width="480px"
    @close="emit('close')"
  >
    <template #description>
      {{ t('wallet.availableBalance') }}:
      <span :class="['font-mono font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        ${{ balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
      </span>
    </template>

    <div class="p-5 sm:p-8 space-y-6">
      <div>
        <label for="withdraw-amount" :class="['block text-xs font-bold tracking-widest mb-3', labelClass]">
          {{ t('wallet.withdrawAmount') }}
        </label>
        <Input
          id="withdraw-amount"
          v-model="amount"
          type="number"
          prefix="$"
          placeholder="0.00"
          class="font-mono font-bold text-xl"
        />
        <button
          :class="['mt-2 text-xs font-bold transition-colors', themeStore.isDarkMode ? 'text-[#7C3AED] hover:text-[#A78BFA]' : 'text-[#7C3AED] hover:text-[#561BAF]']"
          @click="amount = balance.toFixed(2)"
        >
          {{ t('wallet.withdrawAll') }}
        </button>
      </div>

      <div :class="['flex items-center gap-4 p-4 rounded-xl border', surfaceClass]">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
          <Landmark :size="18" />
        </div>
        <div>
          <p :class="['text-xs font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('wallet.destination') }}</p>
          <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ BANK_ACCOUNT.shortName }}</p>
          <p :class="['text-xs font-mono', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">•••• {{ BANK_ACCOUNT.last4 }}</p>
        </div>
      </div>

      <div v-if="parsedAmt > 0" :class="['p-4 rounded-xl border space-y-2 font-mono text-sm animate-fade-in', surfaceClass]">
        <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
          <span>{{ t('wallet.requestedAmount') }}</span>
          <span class="font-bold">${{ parsedAmt.toFixed(2) }}</span>
        </div>
        <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          <span>{{ t('wallet.withdrawalFee') }}</span>
          <span class="text-emerald-500 font-bold">{{ t('common.free') }}</span>
        </div>
        <div :class="['flex justify-between pt-2 border-t font-bold text-base', themeStore.isDarkMode ? 'border-white/10 text-white' : 'border-black/5 text-[#111113]']">
          <span>{{ t('wallet.totalDeposit') }}</span>
          <span>${{ net.toFixed(2) }}</span>
        </div>
      </div>

      <InfoBanner>{{ t('wallet.withdrawalProcessing') }}</InfoBanner>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" @click="emit('close')">{{ t('common.cancel') }}</Button>
      <Button class="flex-1 !py-3.5" :disabled="disabled">
        <ArrowUpFromLine :size="18" /> {{ t('wallet.confirmWithdraw') }}
      </Button>
    </template>
  </Modal>
</template>
