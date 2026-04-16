<script setup>
import { computed, ref } from 'vue'
import { CalendarDays, Clock } from 'lucide-vue-next'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useThemeStore } from '~/stores/theme'
import { useMediaQuery } from '~/composables/useMediaQuery'
import Modal from './Modal.vue'
import Button from './Button.vue'

const props = defineProps({
  selectedDate: { type: String, default: null },
  timeValue: { type: String, default: '14:00' },
})
const emit = defineEmits(['select', 'timeChange', 'confirm', 'close'])

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const isMobile = computed(() => !useMediaQuery('(min-width: 640px)').value)

const monthsShort = computed(() => t('calendar.monthsShort', [], { returnObjects: true }))

const selectedDay = computed({
  get() {
    if (!props.selectedDate) return null
    const parts = props.selectedDate.split(' ')
    if (parts.length !== 3) return null
    const day = parseInt(parts[0])
    const monthIdx = monthsShort.value.indexOf(parts[1])
    const year = parseInt(parts[2])
    if (isNaN(day) || monthIdx === -1 || isNaN(year)) return null
    return new Date(year, monthIdx, day)
  },
  set(val) {
    if (!val) return
    const d = val instanceof Date ? val : new Date(val)
    const label = `${d.getDate()} ${monthsShort.value[d.getMonth()]} ${d.getFullYear()}`
    emit('select', label)
  },
})

const nativeDateValue = computed(() => {
  const d = selectedDay.value
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

const onNativeDate = (e) => {
  const val = e.target.value
  if (!val) return
  const [y, m, d] = val.split('-').map(Number)
  const label = `${d} ${monthsShort.value[m - 1]} ${y}`
  emit('select', label)
}

const onNativeTime = (e) => emit('timeChange', e.target.value)

const hhmm = computed(() => props.timeValue.split(':'))
const hh = computed(() => hhmm.value[0])
const mm = computed(() => hhmm.value[1])

const inputClass = computed(() => {
  const d = themeStore.isDarkMode
  return [
    'w-full rounded-xl px-4 py-3 border text-sm font-medium outline-hidden transition-colors',
    d ? 'bg-[#252429] border-white/10 text-white focus:border-[#7C3AED]/60'
      : 'bg-gray-50 border-gray-200 text-[#111113] focus:border-[#7C3AED]/40',
  ]
})

const hourPresetClass = (h) => {
  if (hh.value === h) return 'bg-[#7C3AED] text-white shadow-xs'
  return themeStore.isDarkMode
    ? 'text-[#888991] hover:text-white hover:bg-white/10'
    : 'text-[#67656E] hover:text-[#111113] hover:bg-gray-100'
}
const minutePresetClass = (m) => {
  if (mm.value === m) return 'bg-[#7C3AED] text-white shadow-xs'
  return themeStore.isDarkMode
    ? 'text-[#888991] hover:text-white hover:bg-white/10'
    : 'text-[#67656E] hover:text-[#111113] hover:bg-gray-100'
}

const handleHourInput = (e) => {
  let v = e.target.value.replace(/\D/g, '')
  if (v.length === 2 && parseInt(v) > 23) v = '23'
  emit('timeChange', `${v}:${mm.value}`)
}
const handleHourBlur = (e) => {
  let v = e.target.value
  if (!v) v = '00'
  if (v.length === 1) v = `0${v}`
  emit('timeChange', `${v}:${mm.value}`)
}
const handleMinuteInput = (e) => {
  let v = e.target.value.replace(/\D/g, '')
  if (v.length === 2 && parseInt(v) > 59) v = '59'
  emit('timeChange', `${hh.value}:${v}`)
}
const handleMinuteBlur = (e) => {
  let v = e.target.value
  if (!v) v = '00'
  if (v.length === 1) v = `0${v}`
  emit('timeChange', `${hh.value}:${v}`)
}

const MINUTES = ['00', '15', '30', '45']
const HOURS = ['06', '08', '10', '12', '14', '18']

const innerHourDivClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/80 border-white/10 focus-within:border-[#7C3AED]/60'
    : 'bg-gray-50 border-gray-200 focus-within:border-[#7C3AED]/40',
)

const presetGridClass = computed(() =>
  themeStore.isDarkMode ? 'bg-[#252429]/80 border-white/10' : 'bg-gray-50 border-gray-200',
)

const dpLocale = computed(() => locale.value)
const dpDarkMode = computed(() => themeStore.isDarkMode ? 'dark' : 'light')
</script>

<template>
  <Modal
    :title="t('calendar.selectDateTime')"
    :icon="CalendarDays"
    max-width="380px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-6">
      <!-- Mobile: native inputs -->
      <div v-if="isMobile" class="space-y-5">
        <div>
          <label :class="['block text-xs font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
            <CalendarDays :size="12" class="inline mr-1.5 text-[#7C3AED]" />
            {{ t('filters.date') }}
          </label>
          <input type="date" :value="nativeDateValue" :class="inputClass" @change="onNativeDate" />
        </div>
        <div>
          <label :class="['block text-xs font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
            <Clock :size="12" class="inline mr-1.5 text-[#7C3AED]" />
            {{ t('calendar.deadline') }}
          </label>
          <input type="time" :value="timeValue" :class="inputClass" @change="onNativeTime" />
        </div>
      </div>

      <!-- Desktop: vue-datepicker + custom time -->
      <div v-else class="space-y-4">
        <VueDatePicker
          v-model="selectedDay"
          inline
          auto-apply
          :enable-time-picker="false"
          :week-start="1"
          :format="'dd MMM yyyy'"
          :locale="dpLocale"
          :dark="themeStore.isDarkMode"
        />

        <div :class="['pt-4 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-100']">
          <span :class="['text-[11px] font-bold flex items-center gap-1.5 mb-3', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
            <Clock :size="12" class="text-[#7C3AED]" /> {{ t('calendar.deadline') }}
          </span>

          <div :class="['grid grid-cols-6 gap-1 p-1 rounded-xl border', presetGridClass]">
            <button
              v-for="h in HOURS"
              :key="h"
              type="button"
              :class="['py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors', hourPresetClass(h)]"
              @click="emit('timeChange', `${h}:${mm}`)"
            >
              {{ h }}:00
            </button>
          </div>

          <div class="flex gap-2 items-center mt-2">
            <div :class="['flex items-center gap-1 rounded-xl px-3 py-2 border flex-1', innerHourDivClass]">
              <input
                type="text"
                inputmode="numeric"
                maxlength="2"
                :value="hh"
                :class="['w-6 text-center text-xs font-mono font-semibold outline-hidden bg-transparent', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']"
                @input="handleHourInput"
                @blur="handleHourBlur"
              />
              <span :class="['text-xs font-mono font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-gray-400']">:</span>
              <input
                type="text"
                inputmode="numeric"
                maxlength="2"
                :value="mm"
                :class="['w-6 text-center text-xs font-mono font-semibold outline-hidden bg-transparent', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']"
                @input="handleMinuteInput"
                @blur="handleMinuteBlur"
              />
            </div>
            <div :class="['grid grid-cols-4 gap-1 p-1 rounded-xl border', presetGridClass]">
              <button
                v-for="m in MINUTES"
                :key="m"
                type="button"
                :class="['px-2 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors', minutePresetClass(m)]"
                @click="emit('timeChange', `${hh}:${m}`)"
              >
                :{{ m }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button class="w-full !py-3.5" :disabled="!selectedDate" @click="emit('confirm')">
        <CalendarDays :size="16" /> {{ t('calendar.confirmDate') }}
      </Button>
    </template>
  </Modal>
</template>
