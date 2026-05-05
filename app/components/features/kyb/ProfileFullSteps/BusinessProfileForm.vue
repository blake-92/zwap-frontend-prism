<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import Input from '~/components/ui/Input.vue'
import Toggle from '~/components/ui/Toggle.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Espejo de BusinessProfileRequest del OpenAPI. Contiene las reglas Stripe:
//   - websiteUrl O noWebsiteReason (one-of, exactly one)
//   - productsDescription ≥ 10
//   - mccCode 4 dígitos
//   - expectedAvg ≤ expectedMax
//   - expectedPaymentMethods del enum
//   - URLs (refund/tos/privacy) opcionales pero validamos formato si vienen
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

const PAYMENT_METHODS = ['CARD_LOCAL', 'CARD_INTERNATIONAL', 'BANK_TRANSFER', 'WALLET_LOCAL', 'CASH', 'CRYPTO']

// websiteUrl O noWebsiteReason (toggle "no tengo sitio").
const noWebsite = ref(Boolean(props.initial.noWebsiteReason && !props.initial.websiteUrl))
const websiteUrl = ref(props.initial.websiteUrl ?? '')
const noWebsiteReason = ref(props.initial.noWebsiteReason ?? '')

const productsDescription = ref(props.initial.productsDescription ?? '')
const mccCode = ref(props.initial.mccCode ?? '')
const expectedMonthlyVolumeCents = ref(toCentsString(props.initial.expectedMonthlyVolumeCents))
const expectedAvgTransactionCents = ref(toCentsString(props.initial.expectedAvgTransactionCents))
const expectedMaxTransactionCents = ref(toCentsString(props.initial.expectedMaxTransactionCents))

// expectedPayerCountries — array de ISO codes. UX: input single con CSV (BO,AR,BR).
const expectedPayerCountriesRaw = ref(
  Array.isArray(props.initial.expectedPayerCountries) ? props.initial.expectedPayerCountries.join(', ') : '',
)
// expectedPaymentMethods — multi-select con checkboxes.
const expectedPaymentMethods = ref(
  Array.isArray(props.initial.expectedPaymentMethods) ? [...props.initial.expectedPaymentMethods] : [],
)

const refundPolicy = ref(props.initial.refundPolicy ?? '')
const termsAndConditions = ref(props.initial.termsAndConditions ?? '')
const privacyPolicy = ref(props.initial.privacyPolicy ?? '')

const errors = ref({})

function toCentsString(v) {
  if (v == null) return ''
  return String(v)
}
function parseInt64OrUndefined(v) {
  if (v == null || v === '') return undefined
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : NaN
}
function isValidUrl(v) {
  if (!v) return true // URL vacía es OK (es opcional)
  return /^https?:\/\/.+/i.test(v.trim())
}
function parseCountries(raw) {
  return raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
}

function validate() {
  const next = {}

  // websiteUrl O noWebsiteReason
  if (noWebsite.value) {
    if (!noWebsiteReason.value.trim()) next.noWebsiteReason = t('kyb.profileFull.errors.noWebsiteReasonRequired')
  } else {
    if (!websiteUrl.value.trim()) next.websiteUrl = t('kyb.profileFull.errors.websiteOrReasonRequired')
    else if (!isValidUrl(websiteUrl.value)) next.websiteUrl = t('kyb.profileFull.errors.websiteUrlInvalid')
  }

  if (productsDescription.value.trim().length < 10) {
    next.productsDescription = t('kyb.profileFull.errors.productsDescriptionShort')
  }
  if (mccCode.value && !/^\d{4}$/.test(mccCode.value.trim())) {
    next.mccCode = t('kyb.profileFull.errors.mccInvalid')
  }

  const avg = parseInt64OrUndefined(expectedAvgTransactionCents.value)
  const max = parseInt64OrUndefined(expectedMaxTransactionCents.value)
  if (Number.isNaN(avg)) next.expectedAvgTransactionCents = t('kyb.profileFull.errors.amountInvalid')
  if (Number.isNaN(max)) next.expectedMaxTransactionCents = t('kyb.profileFull.errors.amountInvalid')
  if (avg !== undefined && max !== undefined && avg > max) {
    next.expectedAvgTransactionCents = t('kyb.profileFull.errors.amountsInverted')
  }

  // Country codes — formato 2 letras mayúsculas si vienen.
  const countries = parseCountries(expectedPayerCountriesRaw.value)
  if (countries.some((c) => !/^[A-Z]{2}$/.test(c))) {
    next.expectedPayerCountries = t('kyb.profileFull.errors.countriesInvalid')
  }

  if (expectedPaymentMethods.value.length === 0) {
    next.expectedPaymentMethods = t('kyb.profileFull.errors.paymentMethodsRequired')
  }

  // URLs de policies — solo formato si vienen.
  if (refundPolicy.value && !isValidUrl(refundPolicy.value)) next.refundPolicy = t('kyb.profileFull.errors.policyUrlInvalid')
  if (termsAndConditions.value && !isValidUrl(termsAndConditions.value)) next.termsAndConditions = t('kyb.profileFull.errors.policyUrlInvalid')
  if (privacyPolicy.value && !isValidUrl(privacyPolicy.value)) next.privacyPolicy = t('kyb.profileFull.errors.policyUrlInvalid')

  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  const monthly = parseInt64OrUndefined(expectedMonthlyVolumeCents.value)
  const avg = parseInt64OrUndefined(expectedAvgTransactionCents.value)
  const max = parseInt64OrUndefined(expectedMaxTransactionCents.value)
  return {
    websiteUrl: noWebsite.value ? undefined : (websiteUrl.value.trim() || undefined),
    noWebsiteReason: noWebsite.value ? (noWebsiteReason.value.trim() || undefined) : undefined,
    productsDescription: productsDescription.value.trim(),
    mccCode: mccCode.value.trim() || undefined,
    expectedMonthlyVolumeCents: Number.isFinite(monthly) ? monthly : undefined,
    expectedAvgTransactionCents: Number.isFinite(avg) ? avg : undefined,
    expectedMaxTransactionCents: Number.isFinite(max) ? max : undefined,
    expectedPayerCountries: parseCountries(expectedPayerCountriesRaw.value).length > 0
      ? parseCountries(expectedPayerCountriesRaw.value) : undefined,
    expectedPaymentMethods: expectedPaymentMethods.value.length > 0 ? [...expectedPaymentMethods.value] : undefined,
    refundPolicy: refundPolicy.value.trim() || undefined,
    termsAndConditions: termsAndConditions.value.trim() || undefined,
    privacyPolicy: privacyPolicy.value.trim() || undefined,
  }
}

function onSubmit() {
  if (!validate()) {
    if (typeof document !== 'undefined') {
      const firstErr = Object.keys(errors.value)[0]
      document.getElementById(`bp-${firstErr}`)?.focus?.()
    }
    return
  }
  emit('submit', buildPayload())
}

function togglePaymentMethod(m) {
  const idx = expectedPaymentMethods.value.indexOf(m)
  if (idx >= 0) expectedPaymentMethods.value.splice(idx, 1)
  else expectedPaymentMethods.value.push(m)
}

// `if` inline en @toggle no es parseable por @vue/compiler-dom — handler nombrado.
function toggleNoWebsite() {
  if (isDisabled.value) return
  noWebsite.value = !noWebsite.value
}

watch([noWebsite, websiteUrl, noWebsiteReason, productsDescription, mccCode, expectedMonthlyVolumeCents, expectedAvgTransactionCents, expectedMaxTransactionCents, expectedPayerCountriesRaw, expectedPaymentMethods, refundPolicy, termsAndConditions, privacyPolicy], () => {
  emit('change', buildPayload())
}, { deep: true })

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const helpCls = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')
const isDisabled = computed(() => props.submitting || props.readonly)

const checkboxOptionCls = (selected) => {
  const dark = themeStore.isDarkMode
  if (selected) return dark ? 'bg-[#7C3AED]/10 border-[#7C3AED]/50 text-white' : 'bg-[#DBD3FB]/40 border-[#7C3AED]/40 text-[#561BAF]'
  return dark ? 'bg-[#111113]/30 border-white/10 text-[#D8D7D9] hover:bg-white/5' : 'bg-white/50 border-white text-[#111113] hover:bg-white'
}
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
    <!-- Sitio web / motivo -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.websiteSection') }}</SectionLabel>
      <p :class="['text-xs mt-2 mb-3', helpCls]">{{ $t('kyb.profileFull.business.websiteHelp') }}</p>
      <label
        :class="[
          'flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer mb-4',
          themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white',
          isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        <span :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ $t('kyb.profileFull.business.noWebsiteToggle') }}
        </span>
        <Toggle :active="noWebsite" :disabled="isDisabled" @toggle="toggleNoWebsite" />
      </label>
      <div v-if="!noWebsite">
        <label for="bp-websiteUrl" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.websiteUrl') }}</label>
        <Input id="bp-websiteUrl" v-model="websiteUrl" type="url" :placeholder="$t('kyb.profileFull.business.websiteUrlPlaceholder')" :aria-invalid="!!errors.websiteUrl" :disabled="isDisabled" />
        <p v-if="errors.websiteUrl" role="alert" :class="errorClass">{{ errors.websiteUrl }}</p>
      </div>
      <div v-else>
        <label for="bp-noWebsiteReason" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.noWebsiteReason') }}</label>
        <Input id="bp-noWebsiteReason" v-model="noWebsiteReason" type="text" :placeholder="$t('kyb.profileFull.business.noWebsiteReasonPlaceholder')" :aria-invalid="!!errors.noWebsiteReason" :disabled="isDisabled" />
        <p v-if="errors.noWebsiteReason" role="alert" :class="errorClass">{{ errors.noWebsiteReason }}</p>
      </div>
    </section>

    <!-- Productos + MCC -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.productsDescription') }}</SectionLabel>
      <div class="space-y-5 mt-3">
        <div>
          <label for="bp-productsDescription" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.productsDescription') }}</label>
          <textarea
            id="bp-productsDescription"
            v-model="productsDescription"
            rows="3"
            required
            :placeholder="$t('kyb.profileFull.business.productsDescriptionPlaceholder')"
            :aria-invalid="!!errors.productsDescription"
            :disabled="isDisabled"
            :class="[
              'w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30',
              themeStore.isDarkMode ? 'bg-[#111113]/40 text-white border-white/10 placeholder-[#888991]' : 'bg-white/60 text-[#111113] border-white placeholder-[#67656E]',
              errors.productsDescription ? '!border-rose-500/60' : '',
            ]"
          />
          <p :class="['text-xs mt-1.5', helpCls]">{{ $t('kyb.profileFull.business.productsDescriptionHelp') }}</p>
          <p v-if="errors.productsDescription" role="alert" :class="errorClass">{{ errors.productsDescription }}</p>
        </div>
        <div class="max-w-xs">
          <label for="bp-mccCode" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.mccCode') }}</label>
          <Input id="bp-mccCode" v-model="mccCode" type="text" :placeholder="$t('kyb.profileFull.business.mccCodePlaceholder')" :aria-invalid="!!errors.mccCode" :disabled="isDisabled" />
          <p :class="['text-xs mt-1.5', helpCls]">{{ $t('kyb.profileFull.business.mccCodeHelp') }}</p>
          <p v-if="errors.mccCode" role="alert" :class="errorClass">{{ errors.mccCode }}</p>
        </div>
      </div>
    </section>

    <!-- Volumen esperado -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.expectedSection') }}</SectionLabel>
      <p :class="['text-xs mt-2 mb-3', helpCls]">{{ $t('kyb.profileFull.business.amountInCents') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label for="bp-expectedMonthlyVolumeCents" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.expectedMonthlyVolume') }}</label>
          <Input id="bp-expectedMonthlyVolumeCents" v-model="expectedMonthlyVolumeCents" type="number" min="0" step="1" :disabled="isDisabled" />
        </div>
        <div>
          <label for="bp-expectedAvgTransactionCents" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.expectedAvg') }}</label>
          <Input id="bp-expectedAvgTransactionCents" v-model="expectedAvgTransactionCents" type="number" min="0" step="1" :aria-invalid="!!errors.expectedAvgTransactionCents" :disabled="isDisabled" />
          <p v-if="errors.expectedAvgTransactionCents" role="alert" :class="errorClass">{{ errors.expectedAvgTransactionCents }}</p>
        </div>
        <div>
          <label for="bp-expectedMaxTransactionCents" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.expectedMax') }}</label>
          <Input id="bp-expectedMaxTransactionCents" v-model="expectedMaxTransactionCents" type="number" min="0" step="1" :aria-invalid="!!errors.expectedMaxTransactionCents" :disabled="isDisabled" />
          <p v-if="errors.expectedMaxTransactionCents" role="alert" :class="errorClass">{{ errors.expectedMaxTransactionCents }}</p>
        </div>
      </div>
      <p :class="['text-xs mt-2', helpCls]">{{ $t('kyb.profileFull.business.expectedAvgMaxHelp') }}</p>
    </section>

    <!-- Países pagadores + métodos -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.expectedPayerCountries') }}</SectionLabel>
      <div class="mt-3">
        <label for="bp-expectedPayerCountries" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.expectedPayerCountries') }}</label>
        <Input id="bp-expectedPayerCountries" v-model="expectedPayerCountriesRaw" type="text" placeholder="BO, AR, BR" :aria-invalid="!!errors.expectedPayerCountries" :disabled="isDisabled" />
        <p :class="['text-xs mt-1.5', helpCls]">{{ $t('kyb.profileFull.business.expectedPayerCountriesHelp') }}</p>
        <p v-if="errors.expectedPayerCountries" role="alert" :class="errorClass">{{ errors.expectedPayerCountries }}</p>
      </div>
    </section>

    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.expectedPaymentMethods') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <label
          v-for="m in PAYMENT_METHODS"
          :key="m"
          :class="[
            'flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
            checkboxOptionCls(expectedPaymentMethods.includes(m)),
            isDisabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        >
          <span class="text-sm font-medium">{{ $t(`kyb.profileFull.business.paymentMethodsOptions.${m}`) }}</span>
          <input
            type="checkbox"
            :checked="expectedPaymentMethods.includes(m)"
            :disabled="isDisabled"
            class="w-4 h-4 accent-[#7C3AED]"
            @change="togglePaymentMethod(m)"
          >
        </label>
      </div>
      <p v-if="errors.expectedPaymentMethods" role="alert" :class="errorClass">{{ errors.expectedPaymentMethods }}</p>
    </section>

    <!-- Policies (URLs) -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.business.policiesSection') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
        <div>
          <label for="bp-refundPolicy" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.refundPolicy') }}</label>
          <Input id="bp-refundPolicy" v-model="refundPolicy" type="url" :placeholder="$t('kyb.profileFull.business.policyUrlPlaceholder')" :aria-invalid="!!errors.refundPolicy" :disabled="isDisabled" />
          <p v-if="errors.refundPolicy" role="alert" :class="errorClass">{{ errors.refundPolicy }}</p>
        </div>
        <div>
          <label for="bp-termsAndConditions" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.termsAndConditions') }}</label>
          <Input id="bp-termsAndConditions" v-model="termsAndConditions" type="url" :placeholder="$t('kyb.profileFull.business.policyUrlPlaceholder')" :aria-invalid="!!errors.termsAndConditions" :disabled="isDisabled" />
          <p v-if="errors.termsAndConditions" role="alert" :class="errorClass">{{ errors.termsAndConditions }}</p>
        </div>
        <div>
          <label for="bp-privacyPolicy" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.business.privacyPolicy') }}</label>
          <Input id="bp-privacyPolicy" v-model="privacyPolicy" type="url" :placeholder="$t('kyb.profileFull.business.policyUrlPlaceholder')" :aria-invalid="!!errors.privacyPolicy" :disabled="isDisabled" />
          <p v-if="errors.privacyPolicy" role="alert" :class="errorClass">{{ errors.privacyPolicy }}</p>
        </div>
      </div>
    </section>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
