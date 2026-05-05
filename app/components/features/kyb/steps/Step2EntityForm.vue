<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import EconomicActivitySearch from '~/components/features/kyb/shared/EconomicActivitySearch.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

const ENTITY_TYPES = ['NATURAL_PERSON', 'SOLE_PROPRIETOR', 'SRL', 'SA', 'LLC', 'INC', 'OTHER']
const JURISDICTION_OPTIONS = [
  { code: 'BO', label: 'Bolivia' },
  { code: 'AR', label: 'Argentina' },
  { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' },
  { code: 'CO', label: 'Colombia' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'MX', label: 'México' },
  { code: 'PE', label: 'Perú' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'ES', label: 'España' },
]

const entityType = ref(props.initial.entityType ?? '')
const legalName = ref(props.initial.legalName ?? '')
const tradingName = ref(props.initial.tradingName ?? '')
const dbaName = ref(props.initial.dbaName ?? '')
const taxId = ref(props.initial.taxId ?? '')
const jurisdiction = ref(props.initial.jurisdiction ?? '')
// La actividad económica vive como objeto { code, description } en el form para que el
// EconomicActivitySearch (combobox) la consuma como modelValue. Al armar el payload
// proyectamos a los 2 campos del backend.
const activity = ref(
  props.initial.economicActivityCode
    ? { code: props.initial.economicActivityCode, description: props.initial.economicActivityDescription ?? '' }
    : null,
)
const incorporationDate = ref(props.initial.incorporationDate ?? '')

const errors = ref({})

// Patrones taxId por jurisdicción. Conservadores — el backend igual valida; el frontend solo
// avisa antes del round-trip. Si la jurisdicción no está en el mapa, NO validamos formato.
const TAX_ID_PATTERNS = {
  BO: /^\d{7,10}$/,        // NIT bolivia: 7-10 dígitos
  US: /^\d{2}-?\d{7}$/,    // EIN: NN-NNNNNNN
  AR: /^\d{2}-?\d{8}-?\d$/, // CUIT: NN-NNNNNNNN-N
  MX: /^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/, // RFC: AAAA000000XXX
}

function validateTaxId(value, jur) {
  if (!value) return true // taxId es opcional en backend
  const pat = TAX_ID_PATTERNS[jur]
  if (!pat) return true
  return pat.test(value.trim().toUpperCase())
}

function validate() {
  const next = {}
  if (!entityType.value) next.entityType = t('kyb.step2.errors.entityTypeRequired')
  if (!legalName.value.trim()) next.legalName = t('kyb.step2.errors.legalNameRequired')
  if (!jurisdiction.value) next.jurisdiction = t('kyb.step2.errors.jurisdictionRequired')
  if (!validateTaxId(taxId.value, jurisdiction.value)) next.taxId = t('kyb.step2.errors.taxIdInvalid')
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
  }
}

function onSubmit() {
  if (!validate()) {
    const firstErr = Object.keys(errors.value)[0]
    if (firstErr && typeof document !== 'undefined') {
      document.getElementById(`step2-${firstErr}`)?.focus?.()
    }
    return
  }
  emit('submit', buildPayload())
}

watch([entityType, legalName, tradingName, dbaName, taxId, jurisdiction, activity, incorporationDate], () => {
  emit('change', buildPayload())
}, { deep: true })

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')

const taxIdPlaceholder = computed(() => {
  if (jurisdiction.value === 'BO') return t('kyb.step2.taxIdPlaceholderBO')
  if (jurisdiction.value === 'US') return t('kyb.step2.taxIdPlaceholderUS')
  return t('kyb.step2.taxIdPlaceholderGeneric')
})
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
      <SectionLabel>{{ $t('kyb.step2.title') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div class="md:col-span-2">
          <label for="step2-entityType" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.entityType') }}</label>
          <select
            id="step2-entityType"
            v-model="entityType"
            required
            aria-required="true"
            :aria-invalid="!!errors.entityType"
            :aria-describedby="errors.entityType ? 'step2-entityType-error' : undefined"
            :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.entityType ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step2.entityType') }}</option>
            <option v-for="et in ENTITY_TYPES" :key="et" :value="et">
              {{ $t(`kyb.step2.entityTypeOptions.${et}`) }}
            </option>
          </select>
          <p v-if="errors.entityType" id="step2-entityType-error" role="alert" :class="errorClass">
            {{ errors.entityType }}
          </p>
        </div>
        <div class="md:col-span-2">
          <label for="step2-legalName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.legalName') }}</label>
          <Input
            id="step2-legalName"
            v-model="legalName"
            type="text"
            required
            aria-required="true"
            :placeholder="$t('kyb.step2.legalNamePlaceholder')"
            :aria-invalid="!!errors.legalName"
            :aria-describedby="errors.legalName ? 'step2-legalName-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.legalName" id="step2-legalName-error" role="alert" :class="errorClass">
            {{ errors.legalName }}
          </p>
        </div>
        <div>
          <label for="step2-tradingName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.tradingNameOptional') }}</label>
          <Input id="step2-tradingName" v-model="tradingName" type="text" :disabled="submitting" />
        </div>
        <div>
          <label for="step2-dbaName" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.dbaNameOptional') }}</label>
          <Input id="step2-dbaName" v-model="dbaName" type="text" :disabled="submitting" />
        </div>
        <div>
          <label for="step2-jurisdiction" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.jurisdiction') }}</label>
          <select
            id="step2-jurisdiction"
            v-model="jurisdiction"
            required
            aria-required="true"
            :aria-invalid="!!errors.jurisdiction"
            :aria-describedby="errors.jurisdiction ? 'step2-jurisdiction-error' : undefined"
            :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.jurisdiction ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step2.jurisdictionPlaceholder') }}</option>
            <option v-for="j in JURISDICTION_OPTIONS" :key="j.code" :value="j.code">{{ j.label }} ({{ j.code }})</option>
          </select>
          <p v-if="errors.jurisdiction" id="step2-jurisdiction-error" role="alert" :class="errorClass">
            {{ errors.jurisdiction }}
          </p>
        </div>
        <div>
          <label for="step2-taxId" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.taxId') }}</label>
          <Input
            id="step2-taxId"
            v-model="taxId"
            type="text"
            :placeholder="taxIdPlaceholder"
            :aria-invalid="!!errors.taxId"
            :aria-describedby="errors.taxId ? 'step2-taxId-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.taxId" id="step2-taxId-error" role="alert" :class="errorClass">
            {{ errors.taxId }}
          </p>
        </div>
        <div class="md:col-span-2">
          <label :class="[fieldClass, labelCls]">{{ $t('kyb.step2.economicActivity') }}</label>
          <EconomicActivitySearch
            v-model="activity"
            :jurisdiction="jurisdiction || 'BO'"
            :disabled="submitting || !jurisdiction"
          />
          <p v-if="!jurisdiction" :class="['text-xs mt-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ $t('kyb.step2.economicActivityHelp') }}
          </p>
        </div>
        <div>
          <label for="step2-incorporationDate" :class="[fieldClass, labelCls]">{{ $t('kyb.step2.incorporationDateOptional') }}</label>
          <input
            id="step2-incorporationDate"
            v-model="incorporationDate"
            type="date"
            :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
        </div>
      </div>
    </section>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
