<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Una instancia por LegalEntity. El padre (ProfileFullView) renderea N (1..2) instancias y
// orquesta el guardado per-entity. Si jurisdiction !== 'US', los campos registeredState +
// registeredAgent NO se renderean.
//
// Espejo de ProfileEntityFullRequest del OpenAPI.
const props = defineProps({
  // El LegalEntityProfile completo — necesitamos id (route param), jurisdiction (toggle US),
  // legalName + primary (header del bloque).
  entity: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

const COUNTRY_OPTIONS = [
  { code: 'BO', label: 'Bolivia' }, { code: 'AR', label: 'Argentina' }, { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' }, { code: 'CO', label: 'Colombia' }, { code: 'EC', label: 'Ecuador' },
  { code: 'MX', label: 'México' }, { code: 'PE', label: 'Perú' }, { code: 'PY', label: 'Paraguay' },
  { code: 'UY', label: 'Uruguay' }, { code: 'US', label: 'Estados Unidos' }, { code: 'ES', label: 'España' },
]
const CURRENCY_OPTIONS = ['USD', 'EUR', 'BOB', 'ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'PYG', 'UYU']

const initialAddress = props.entity.registeredAddress ?? {}
const initialAgent = props.entity.registeredAgent ?? {}

const street = ref(initialAddress.street ?? '')
const city = ref(initialAddress.city ?? '')
const region = ref(initialAddress.region ?? '')
const postalCode = ref(initialAddress.postalCode ?? '')
const country = ref(initialAddress.country ?? '')
const shareCapital = ref(props.entity.shareCapital != null ? String(props.entity.shareCapital) : '')
const shareCapitalCurrency = ref(props.entity.shareCapitalCurrency ?? '')
// US-only.
const registeredState = ref(props.entity.registeredState ?? '')
const agentName = ref(initialAgent.name ?? '')
const agentAddress = ref(initialAgent.address ?? '')

const isUS = computed(() => props.entity.jurisdiction === 'US')

const errors = ref({})

function validate() {
  const next = {}
  if (!street.value.trim() || !city.value.trim() || !country.value) {
    next.address = t('kyb.profileFull.errors.addressIncomplete')
  }
  // shareCapital + currency van juntos o ninguno.
  const hasAmount = shareCapital.value.trim() !== ''
  const hasCurrency = shareCapitalCurrency.value !== ''
  if (hasAmount !== hasCurrency) {
    next.shareCapital = t('kyb.profileFull.errors.shareCapitalNeedsCurrency')
  }
  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  const payload = {
    registeredAddress: {
      street: street.value.trim(),
      city: city.value.trim(),
      country: country.value,
      region: region.value.trim() || undefined,
      postalCode: postalCode.value.trim() || undefined,
    },
  }
  if (shareCapital.value.trim() !== '' && shareCapitalCurrency.value) {
    const n = Number.parseFloat(shareCapital.value)
    if (Number.isFinite(n)) payload.shareCapital = n
    payload.shareCapitalCurrency = shareCapitalCurrency.value
  }
  if (isUS.value) {
    payload.registeredState = registeredState.value.trim() || undefined
    if (agentName.value.trim() || agentAddress.value.trim()) {
      payload.registeredAgent = {
        name: agentName.value.trim() || undefined,
        address: agentAddress.value.trim() || undefined,
      }
    }
  }
  return payload
}

function onSubmit() {
  if (!validate()) {
    if (typeof document !== 'undefined') {
      const firstErr = Object.keys(errors.value)[0]
      if (firstErr === 'address') document.getElementById(`kyb-${props.entity.id}-street`)?.focus?.()
    }
    return
  }
  emit('submit', { entityId: props.entity.id, payload: buildPayload() })
}

watch([street, city, region, postalCode, country, shareCapital, shareCapitalCurrency, registeredState, agentName, agentAddress], () => {
  emit('change', { entityId: props.entity.id, payload: buildPayload() })
})

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')
const isDisabled = computed(() => props.submitting || props.readonly)
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
    <header class="flex items-baseline gap-2">
      <SectionLabel>{{ $t('kyb.profileFull.kyb.title') }}</SectionLabel>
      <span :class="['text-xs font-bold px-2.5 py-0.5 rounded-full', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
        {{ $t('kyb.profileFull.kyb.entitySelector', { name: entity.legalName }) }}
      </span>
    </header>
    <p :class="['text-sm', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
      {{ $t('kyb.profileFull.kyb.description') }}
    </p>

    <!-- Domicilio registrado -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyb.registeredAddress') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div class="md:col-span-2">
          <label :for="`kyb-${entity.id}-street`" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressStreet') }}</label>
          <Input :id="`kyb-${entity.id}-street`" v-model="street" type="text" required aria-required="true" :aria-invalid="!!errors.address" :disabled="isDisabled" />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-city`" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCity') }}</label>
          <Input :id="`kyb-${entity.id}-city`" v-model="city" type="text" required aria-required="true" :disabled="isDisabled" />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-region`" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressRegionOptional') }}</label>
          <Input :id="`kyb-${entity.id}-region`" v-model="region" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-postalCode`" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressPostalCodeOptional') }}</label>
          <Input :id="`kyb-${entity.id}-postalCode`" v-model="postalCode" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-country`" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCountry') }}</label>
          <select :id="`kyb-${entity.id}-country`" v-model="country" required aria-required="true" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
            <option value="" disabled>—</option>
            <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
          </select>
        </div>
      </div>
      <p v-if="errors.address" role="alert" :class="errorClass">{{ errors.address }}</p>
    </section>

    <!-- Capital social -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyb.shareCapitalSection') }}</SectionLabel>
      <p :class="['text-xs mt-2 mb-3', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.profileFull.kyb.shareCapitalHelp') }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="md:col-span-2">
          <label :for="`kyb-${entity.id}-shareCapital`" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyb.shareCapital') }}</label>
          <Input
            :id="`kyb-${entity.id}-shareCapital`"
            v-model="shareCapital"
            type="number"
            step="0.01"
            min="0"
            :aria-invalid="!!errors.shareCapital"
            :disabled="isDisabled"
          />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-shareCapitalCurrency`" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyb.shareCapitalCurrency') }}</label>
          <select :id="`kyb-${entity.id}-shareCapitalCurrency`" v-model="shareCapitalCurrency" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
            <option value="">—</option>
            <option v-for="c in CURRENCY_OPTIONS" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
      <p v-if="errors.shareCapital" role="alert" :class="errorClass">{{ errors.shareCapital }}</p>
    </section>

    <!-- US-only: registered state + agent -->
    <section v-if="isUS">
      <SectionLabel>{{ $t('kyb.profileFull.kyb.registeredStateSection') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div>
          <label :for="`kyb-${entity.id}-registeredState`" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyb.registeredState') }}</label>
          <Input :id="`kyb-${entity.id}-registeredState`" v-model="registeredState" type="text" :placeholder="$t('kyb.profileFull.kyb.registeredStatePlaceholder')" :disabled="isDisabled" />
        </div>
        <div>
          <label :for="`kyb-${entity.id}-agentName`" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyb.registeredAgentName') }}</label>
          <Input :id="`kyb-${entity.id}-agentName`" v-model="agentName" type="text" :disabled="isDisabled" />
        </div>
        <div class="md:col-span-2">
          <label :for="`kyb-${entity.id}-agentAddress`" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyb.registeredAgentAddress') }}</label>
          <Input :id="`kyb-${entity.id}-agentAddress`" v-model="agentAddress" type="text" :disabled="isDisabled" />
        </div>
      </div>
    </section>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
