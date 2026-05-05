<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import EconomicActivitySearch from '~/components/features/kyb/shared/EconomicActivitySearch.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Step opcional: clientes híbridos (ej. SRL Bolivia + LLC US). El parent decide si renderearlo
// según un toggle "agregar entidad adicional" en WizardView. Si el step se carga, este form
// es responsable de su propia validación.
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

const ENTITY_TYPES = ['NATURAL_PERSON', 'SOLE_PROPRIETOR', 'SRL', 'SA', 'LLC', 'INC', 'OTHER']
const JURISDICTION_OPTIONS = [
  { code: 'BO', label: 'Bolivia' }, { code: 'AR', label: 'Argentina' }, { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' }, { code: 'CO', label: 'Colombia' }, { code: 'EC', label: 'Ecuador' },
  { code: 'MX', label: 'México' }, { code: 'PE', label: 'Perú' }, { code: 'PY', label: 'Paraguay' },
  { code: 'UY', label: 'Uruguay' }, { code: 'US', label: 'Estados Unidos' }, { code: 'ES', label: 'España' },
]
const CURRENCY_OPTIONS = ['USD', 'EUR', 'BOB', 'ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'PYG', 'UYU']

const entityType = ref(props.initial.entityType ?? '')
const legalName = ref(props.initial.legalName ?? '')
const tradingName = ref(props.initial.tradingName ?? '')
const dbaName = ref(props.initial.dbaName ?? '')
const taxId = ref(props.initial.taxId ?? '')
const jurisdiction = ref(props.initial.jurisdiction ?? '')
const activity = ref(
  props.initial.economicActivityCode
    ? { code: props.initial.economicActivityCode, description: props.initial.economicActivityDescription ?? '' }
    : null,
)
const incorporationDate = ref(props.initial.incorporationDate ?? '')
const currency = ref(props.initial.currency ?? '')

const errors = ref({})

function validate() {
  const next = {}
  if (!entityType.value) next.entityType = t('kyb.step2.errors.entityTypeRequired')
  if (!legalName.value.trim()) next.legalName = t('kyb.step2.errors.legalNameRequired')
  if (!jurisdiction.value) next.jurisdiction = t('kyb.step2.errors.jurisdictionRequired')
  if (!currency.value) next.currency = t('kyb.step2.errors.entityTypeRequired') // reuse generic — backend valida específico
  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  return {
    entityType: entityType.value,
    legalName: legalName.value.trim(),
    tradingName: tradingName.value.trim() || undefined,
    dbaName: dbaName.value.trim() || undefined,
    taxId: taxId.value.trim() || undefined,
    jurisdiction: jurisdiction.value,
    economicActivityCode: activity.value?.code,
    economicActivityDescription: activity.value?.description,
    incorporationDate: incorporationDate.value || undefined,
    currency: currency.value,
  }
}

function onSubmit() {
  if (!validate()) return
  emit('submit', buildPayload())
}

watch([entityType, legalName, tradingName, dbaName, taxId, jurisdiction, activity, incorporationDate, currency], () => {
  emit('change', buildPayload())
}, { deep: true })

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')
</script>

<template>
  <motion.form
    novalidate
    class="space-y-8"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="SPRING_SOFT"
    @submit.prevent="onSubmit"
  >
    <section>
      <SectionLabel>{{ $t('kyb.step4.title') }}</SectionLabel>
      <p :class="['text-sm mt-2 mb-5 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.step4.description') }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="md:col-span-2">
          <label for="step4-entityType" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.entityType') }}</label>
          <select id="step4-entityType" v-model="entityType" required :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.entityType ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step2.entityType') }}</option>
            <option v-for="et in ENTITY_TYPES" :key="et" :value="et">
              {{ $t(`kyb.step2.entityTypeOptions.${et}`) }}
            </option>
          </select>
          <p v-if="errors.entityType" role="alert" :class="errorClass">{{ errors.entityType }}</p>
        </div>
        <div class="md:col-span-2">
          <label for="step4-legalName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.legalName') }}</label>
          <Input id="step4-legalName" v-model="legalName" type="text" required :placeholder="$t('kyb.step2.legalNamePlaceholder')" :aria-invalid="!!errors.legalName" :disabled="submitting" />
          <p v-if="errors.legalName" role="alert" :class="errorClass">{{ errors.legalName }}</p>
        </div>
        <div>
          <label for="step4-tradingName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.tradingNameOptional') }}</label>
          <Input id="step4-tradingName" v-model="tradingName" type="text" :disabled="submitting" />
        </div>
        <div>
          <label for="step4-dbaName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.dbaNameOptional') }}</label>
          <Input id="step4-dbaName" v-model="dbaName" type="text" :disabled="submitting" />
        </div>
        <div>
          <label for="step4-jurisdiction" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.jurisdiction') }}</label>
          <select id="step4-jurisdiction" v-model="jurisdiction" required :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.jurisdiction ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step2.jurisdictionPlaceholder') }}</option>
            <option v-for="j in JURISDICTION_OPTIONS" :key="j.code" :value="j.code">{{ j.label }} ({{ j.code }})</option>
          </select>
          <p v-if="errors.jurisdiction" role="alert" :class="errorClass">{{ errors.jurisdiction }}</p>
        </div>
        <div>
          <label for="step4-taxId" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.taxId') }}</label>
          <Input id="step4-taxId" v-model="taxId" type="text" :placeholder="$t('kyb.step2.taxIdPlaceholderGeneric')" :disabled="submitting" />
        </div>
        <div>
          <label for="step4-currency" :class="[fieldClass, labelCls]">{{ $t('kyb.step4.currency') }}</label>
          <select id="step4-currency" v-model="currency" required :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.currency ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step4.currencyPlaceholder') }}</option>
            <option v-for="c in CURRENCY_OPTIONS" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label :class="[fieldClass, labelCls]">{{ $t('kyb.step2.economicActivity') }}</label>
          <EconomicActivitySearch v-model="activity" :jurisdiction="jurisdiction || 'BO'" :disabled="submitting || !jurisdiction" />
        </div>
        <div>
          <label for="step4-incorporationDate" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.incorporationDateOptional') }}</label>
          <input id="step4-incorporationDate" v-model="incorporationDate" type="date" :disabled="submitting" :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]">
        </div>
      </div>
    </section>
    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
