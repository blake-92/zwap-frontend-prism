<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  Plus, Trash2, Mail, User, ListTree,
  Link as LinkIcon, CalendarDays,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { SPRING } from '~/utils/springs'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import DatePickerModal from '~/components/ui/DatePickerModal.vue'

const props = defineProps({
  link: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const themeStore = useThemeStore()
const isDesktop = useMediaQuery('(min-width: 640px)')
const isEditing = computed(() => !!props.link)

const buildInitialItems = () => {
  if (!props.link) return [{ id: 1, desc: '', amount: '' }]
  const count = props.link.items || 1
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    desc: i === 0 ? (props.link.client || '') : '',
    amount: i === 0 ? (props.link.amount?.replace(/,/g, '') || '') : '',
  }))
}

const items = ref(buildInitialItems())
const nextItemId = ref((props.link?.items || 1) + 1)
const feeMode = ref('hotel')
const clientFeePercent = ref(50)
const selectedDate = ref(null)
const timeValue = ref('14:00')
const calendarOpen = ref(false)
const showConfirmClose = ref(false)
const isGenerating = ref(false)

watch(() => props.link, () => {
  items.value = buildInitialItems()
  nextItemId.value = (props.link?.items || 1) + 1
})

const hasData = computed(() => {
  const hasItems = items.value.some(it => it.desc.trim() !== '' || it.amount.trim() !== '')
  return hasItems || selectedDate.value !== null || feeMode.value !== 'hotel' || timeValue.value !== '14:00'
})

const handleClose = () => {
  if (hasData.value) showConfirmClose.value = true
  else emit('close')
}

const addItem = () => {
  items.value.push({ id: nextItemId.value, desc: '', amount: '' })
  nextItemId.value += 1
}
const removeItem = (i) => { items.value.splice(i, 1) }
const updateItem = (i, field, val) => { items.value[i][field] = val }

let generateTimer = null
const handleGenerate = () => {
  isGenerating.value = true
  generateTimer = setTimeout(() => {
    generateTimer = null
    isGenerating.value = false
    emit('close')
  }, 1500)
}
onUnmounted(() => {
  if (generateTimer) clearTimeout(generateTimer)
})

const FEE_RATE = 0.03
const subtotal = computed(() => items.value.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0))
const totalFee = computed(() => subtotal.value * FEE_RATE)
const clientFeeShare = computed(() => {
  if (feeMode.value === 'hotel') return 0
  if (feeMode.value === 'cliente') return totalFee.value
  return totalFee.value * (clientFeePercent.value / 100)
})
const total = computed(() => subtotal.value + clientFeeShare.value)

const feeOptions = computed(() => [
  { value: 'hotel', label: t('refund.hotelBearer') },
  { value: 'shared', label: t('links.feeShared') },
  { value: 'cliente', label: t('refund.clientBearer') },
])

const sliderStyle = computed(() => ({
  background: `linear-gradient(to right, ${themeStore.isDarkMode ? '#7C3AED33' : '#7C3AED22'} 0%, ${themeStore.isDarkMode ? '#7C3AED99' : '#7C3AED'} 100%)`,
}))
</script>

<template>
  <!-- Date picker — self-contained con z=60, teleport propio. Coordina stack con Modal padre. -->
  <DatePickerModal
    :is-open="calendarOpen"
    :selected-date="selectedDate"
    :time-value="timeValue"
    @select="selectedDate = $event"
    @time-change="timeValue = $event"
    @confirm="calendarOpen = false"
    @close="calendarOpen = false"
  />

  <Modal
    :title="isEditing ? t('links.editLink') : t('links.createLink')"
    :description="isDesktop ? (isEditing ? t('links.editLinkDesc') : t('links.generateDescription')) : ''"
    :icon="LinkIcon"
    max-width="580px"
    wrapper-class="max-h-[95vh] sm:max-h-[90vh] flex flex-col"
    @close="handleClose"
  >
    <div class="p-5 sm:p-8 space-y-6">
      <!-- Fecha -->
      <div>
        <SectionLabel class="flex items-center gap-2 mb-4">
          <CalendarDays :size="14" /> {{ t('links.expirationDate') }}
        </SectionLabel>
        <Button
          variant="outline"
          :class="[
            'w-full justify-start text-left font-normal',
            !selectedDate ? (themeStore.isDarkMode ? '!text-[#888991]' : '!text-[#B0AFB4]') : ''
          ]"
          @click="calendarOpen = true"
        >
          <CalendarDays :size="16" :class="['mr-2 shrink-0', selectedDate ? 'text-[#7C3AED]' : 'opacity-50']" />
          <span class="truncate">
            {{ selectedDate ? `${selectedDate} – ${timeValue}` : t('links.selectDateTime') }}
          </span>
        </Button>
      </div>

      <!-- Cliente -->
      <div>
        <SectionLabel class="flex items-center gap-2 mb-4">
          <User :size="14" /> {{ t('links.clientData') }}
        </SectionLabel>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="link-client-name" :class="['block text-xs font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
              {{ t('links.clientName') }}
            </label>
            <Input id="link-client-name" type="text" :placeholder="t('links.clientNamePlaceholder')" />
          </div>
          <div>
            <label for="link-client-email" :class="['block text-xs font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
              {{ t('links.clientEmail') }}
            </label>
            <Input id="link-client-email" :icon="Mail" type="email" placeholder="alice@example.com" />
          </div>
        </div>
      </div>

      <!-- Items -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <SectionLabel class="flex items-center gap-2">
            <ListTree :size="14" /> {{ t('links.itemBuilder') }}
          </SectionLabel>
          <Button variant="outline" size="sm" class="!h-8 !px-3" @click="addItem">
            <Plus :size="14" /> {{ t('links.addItem') }}
          </Button>
        </div>
        <div :class="['p-4 rounded-2xl border space-y-3', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5']">
          <div v-for="(item, idx) in items" :key="item.id" class="flex gap-2 sm:gap-3 items-start animate-fade-in">
            <div class="flex-1 min-w-0">
              <Input
                type="text"
                :placeholder="t('links.conceptPlaceholder')"
                :model-value="item.desc"
                @update:model-value="updateItem(idx, 'desc', $event)"
              />
            </div>
            <div class="w-28 sm:w-32 shrink-0">
              <Input
                type="number"
                min="0"
                :placeholder="t('links.price')"
                :model-value="item.amount"
                @update:model-value="updateItem(idx, 'amount', $event)"
              />
            </div>
            <Button v-if="items.length > 1" :aria-label="t('common.delete')" variant="danger" size="icon" class="shrink-0 mt-1" @click="removeItem(idx)">
              <Trash2 :size="16" />
            </Button>
            <Button v-else :aria-label="t('common.delete')" variant="ghost" size="icon" disabled class="shrink-0 mt-1 opacity-20 cursor-not-allowed">
              <Trash2 :size="16" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full space-y-4">
        <div>
          <label :class="['block text-[11px] font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ t('links.bankFee') }}
          </label>
          <SegmentControl v-model="feeMode" :options="feeOptions" />
        </div>

        <AnimatePresence>
          <motion.div
            v-if="feeMode === 'shared'"
            :initial="{ opacity: 0, height: 0 }"
            :animate="{ opacity: 1, height: 'auto' }"
            :exit="{ opacity: 0, height: 0 }"
            :transition="SPRING"
            class="overflow-hidden"
          >
            <div :class="['rounded-xl p-3', themeStore.isDarkMode ? 'bg-[#111113]/40 border border-white/5' : 'bg-gray-50/80 border border-black/5']">
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                :value="clientFeePercent"
                class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#7C3AED]"
                :style="sliderStyle"
                @input="clientFeePercent = Number($event.target.value)"
              />
              <div class="flex justify-between mt-2">
                <span :class="['text-[11px] font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ t('links.feeHotelShare', { percent: 100 - clientFeePercent }) }}
                </span>
                <span class="text-[11px] font-bold text-[#7C3AED]">
                  {{ t('links.feeClientShare', { percent: clientFeePercent }) }}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div :class="['rounded-xl p-3 space-y-2 font-mono text-xs', themeStore.isDarkMode ? 'bg-[#111113]/60 border border-white/5' : 'bg-gray-50 border border-black/5']">
          <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            <span>{{ t('links.subtotal') }} ({{ items.length }}):</span>
            <span :class="themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="feeMode === 'hotel'" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            <span>{{ t('links.stripeFee') }}:</span>
            <span>{{ t('links.absorbed') }}</span>
          </div>
          <div v-if="feeMode === 'cliente'" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            <span>{{ t('links.feeClientLabel', { percent: 100 }) }}:</span>
            <span :class="themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'">+${{ clientFeeShare.toFixed(2) }}</span>
          </div>
          <template v-if="feeMode === 'shared'">
            <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
              <span>{{ t('links.feeHotelLabel', { percent: 100 - clientFeePercent }) }}:</span>
              <span>{{ t('links.absorbed') }}</span>
            </div>
            <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
              <span>{{ t('links.feeClientLabel', { percent: clientFeePercent }) }}:</span>
              <span :class="themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'">+${{ clientFeeShare.toFixed(2) }}</span>
            </div>
          </template>
          <div :class="['flex justify-between items-end pt-2 mt-1 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-200']">
            <span :class="['font-sans font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
              {{ t('links.totalCharge') }}:
            </span>
            <span class="text-2xl font-bold tracking-tighter text-[#7C3AED]">${{ total.toFixed(2) }}</span>
          </div>
        </div>

        <Button
          class="w-full !py-4 shadow-lg relative overflow-hidden"
          :disabled="isGenerating || !selectedDate || subtotal === 0"
          @click="handleGenerate"
        >
          <span v-if="isGenerating" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            {{ isEditing ? t('links.saving') : t('common.generating') }}...
          </span>
          <span v-else class="flex items-center gap-2">
            <LinkIcon :size="18" /> {{ isEditing ? t('links.saveChanges') : t('links.generateLink') }}
          </span>
        </Button>
      </div>
    </template>
  </Modal>

  <!-- Confirm close sub-modal -->
  <AnimatePresence>
    <Modal
      v-if="showConfirmClose"
      :title="t('common.discardConfirmTitle')"
      max-width="360px"
      @close="showConfirmClose = false"
    >
      <p :class="['px-5 sm:px-8 py-5 text-sm', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ t('common.discardConfirmBody') }}
      </p>
      <template #footer>
        <Button variant="ghost" class="flex-1" @click="showConfirmClose = false">{{ t('common.cancel') }}</Button>
        <Button variant="danger" class="flex-1" @click="emit('close')">{{ t('common.discardConfirmAction') }}</Button>
      </template>
    </Modal>
  </AnimatePresence>
</template>
