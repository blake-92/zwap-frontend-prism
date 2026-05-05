<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import Input from '~/components/ui/Input.vue'
import Toggle from '~/components/ui/Toggle.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Pure controlled form. Espejo de ProfilePersonFullRequest del OpenAPI:
//   - maritalStatus, occupation
//   - residentialAddress (REQ)
//   - sourceOfFunds + sourceOfFundsDetails
//   - pepDetails / pepRelationDetails (objetos libres — solo si isPep/isPepRelated)
//   - usPerson + usTaxId (REQ si usPerson=true)
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  // Si el caller no tiene SETTINGS_MERCHANT, igual puede editar SU person (datos propios) —
  // este flag NO bloquea el form, solo lo recibe para alinear UI.
  readonly: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  // Hereda isPep/isPepRelated desde la fase 2 (KYC inicial). El form solo muestra el bloque
  // PEP cuando alguno es true — sino no aplica.
  isPep: { type: Boolean, default: false },
  isPepRelated: { type: Boolean, default: false },
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

const MARITAL_OPTIONS = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER']
const SOURCE_OF_FUNDS_OPTIONS = ['BUSINESS_INCOME', 'EMPLOYMENT', 'INVESTMENTS', 'INHERITANCE', 'SAVINGS', 'OTHER']

const initialAddress = props.initial.residentialAddress ?? {}

const maritalStatus = ref(props.initial.maritalStatus ?? '')
const occupation = ref(props.initial.occupation ?? '')
const street = ref(initialAddress.street ?? '')
const city = ref(initialAddress.city ?? '')
const region = ref(initialAddress.region ?? '')
const postalCode = ref(initialAddress.postalCode ?? '')
const country = ref(initialAddress.country ?? '')
const sourceOfFunds = ref(props.initial.sourceOfFunds ?? '')
const sourceOfFundsDetails = ref(props.initial.sourceOfFundsDetails ?? '')

// PEP details — campos libres para satisfacer el JSONB del backend. Si el user marcó isPep
// en el wizard, este bloque pide cargo + entidad + fecha desde.
const pepPosition = ref(props.initial.pepDetails?.position ?? '')
const pepEntity = ref(props.initial.pepDetails?.entity ?? '')
const pepStartDate = ref(props.initial.pepDetails?.startDate ?? '')

const usPerson = ref(Boolean(props.initial.usPerson))
const usTaxId = ref(props.initial.usTaxId ?? '')

const errors = ref({})

function validate() {
  const next = {}
  if (!street.value.trim() || !city.value.trim() || !country.value) {
    next.address = t('kyb.profileFull.errors.addressIncomplete')
  }
  if (usPerson.value && !usTaxId.value.trim()) {
    next.usTaxId = t('kyb.profileFull.errors.usTaxIdRequired')
  }
  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  const payload = {
    maritalStatus: maritalStatus.value || undefined,
    occupation: occupation.value.trim() || undefined,
    residentialAddress: {
      street: street.value.trim(),
      city: city.value.trim(),
      country: country.value,
      region: region.value.trim() || undefined,
      postalCode: postalCode.value.trim() || undefined,
    },
    sourceOfFunds: sourceOfFunds.value || undefined,
    sourceOfFundsDetails: sourceOfFundsDetails.value.trim() || undefined,
    usPerson: usPerson.value,
    usTaxId: usPerson.value && usTaxId.value.trim() ? usTaxId.value.trim() : undefined,
  }
  if (props.isPep) {
    payload.pepDetails = {
      position: pepPosition.value.trim() || undefined,
      entity: pepEntity.value.trim() || undefined,
      startDate: pepStartDate.value || undefined,
    }
  }
  return payload
}

function onSubmit() {
  if (!validate()) {
    if (typeof document !== 'undefined') {
      const firstErr = Object.keys(errors.value)[0]
      if (firstErr === 'address') document.getElementById('kyc-street')?.focus?.()
      if (firstErr === 'usTaxId') document.getElementById('kyc-usTaxId')?.focus?.()
    }
    return
  }
  emit('submit', buildPayload())
}

watch([maritalStatus, occupation, street, city, region, postalCode, country, sourceOfFunds, sourceOfFundsDetails, pepPosition, pepEntity, pepStartDate, usPerson, usTaxId], () => {
  emit('change', buildPayload())
})

// `if` inline en @toggle no es parseable por @vue/compiler-dom (sí por Vite runtime, pero
// rompe vitest jsdom). Handler nombrado evita el bug.
function toggleUsPerson() {
  if (isDisabled.value) return
  usPerson.value = !usPerson.value
}

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
    <!-- Datos personales -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyc.title') }}</SectionLabel>
      <p :class="['text-sm mt-2 mb-5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.profileFull.kyc.description') }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label for="kyc-maritalStatus" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.maritalStatus') }}</label>
          <select id="kyc-maritalStatus" v-model="maritalStatus" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
            <option value="">—</option>
            <option v-for="m in MARITAL_OPTIONS" :key="m" :value="m">
              {{ $t(`kyb.profileFull.kyc.maritalStatusOptions.${m}`) }}
            </option>
          </select>
        </div>
        <div>
          <label for="kyc-occupation" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.occupation') }}</label>
          <Input
            id="kyc-occupation"
            v-model="occupation"
            type="text"
            :placeholder="$t('kyb.profileFull.kyc.occupationPlaceholder')"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </section>

    <!-- Domicilio -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyc.residentialAddress') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div class="md:col-span-2">
          <label for="kyc-street" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressStreet') }}</label>
          <Input id="kyc-street" v-model="street" type="text" required aria-required="true" :aria-invalid="!!errors.address" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-city" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCity') }}</label>
          <Input id="kyc-city" v-model="city" type="text" required aria-required="true" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-region" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressRegionOptional') }}</label>
          <Input id="kyc-region" v-model="region" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-postalCode" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressPostalCodeOptional') }}</label>
          <Input id="kyc-postalCode" v-model="postalCode" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-country" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCountry') }}</label>
          <select id="kyc-country" v-model="country" required aria-required="true" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
            <option value="" disabled>{{ $t('kyb.step1.nationalityPlaceholder') }}</option>
            <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
          </select>
        </div>
      </div>
      <p v-if="errors.address" id="kyc-address-error" role="alert" :class="errorClass">{{ errors.address }}</p>
    </section>

    <!-- Origen de fondos -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyc.sourceOfFunds') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div>
          <label for="kyc-sourceOfFunds" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.sourceOfFunds') }}</label>
          <select id="kyc-sourceOfFunds" v-model="sourceOfFunds" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
            <option value="">—</option>
            <option v-for="s in SOURCE_OF_FUNDS_OPTIONS" :key="s" :value="s">
              {{ $t(`kyb.profileFull.kyc.sourceOfFundsOptions.${s}`) }}
            </option>
          </select>
        </div>
        <div>
          <label for="kyc-sourceOfFundsDetails" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.sourceOfFundsDetails') }}</label>
          <Input id="kyc-sourceOfFundsDetails" v-model="sourceOfFundsDetails" type="text" :placeholder="$t('kyb.profileFull.kyc.sourceOfFundsDetailsPlaceholder')" :disabled="isDisabled" />
        </div>
      </div>
    </section>

    <!-- PEP details (solo si isPep o isPepRelated) -->
    <section v-if="isPep || isPepRelated">
      <SectionLabel>{{ $t('kyb.profileFull.kyc.pepDetailsTitle') }}</SectionLabel>
      <p :class="['text-sm mt-2 mb-5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.profileFull.kyc.pepDetailsHelp') }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label for="kyc-pepPosition" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.pepPosition') }}</label>
          <Input id="kyc-pepPosition" v-model="pepPosition" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-pepEntity" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.pepEntity') }}</label>
          <Input id="kyc-pepEntity" v-model="pepEntity" type="text" :disabled="isDisabled" />
        </div>
        <div>
          <label for="kyc-pepStartDate" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.pepStartDate') }}</label>
          <input id="kyc-pepStartDate" v-model="pepStartDate" type="date" :disabled="isDisabled"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
          >
        </div>
      </div>
    </section>

    <!-- US person -->
    <section>
      <SectionLabel>{{ $t('kyb.profileFull.kyc.usPersonSection') }}</SectionLabel>
      <p :class="['text-xs mt-2 mb-3 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.profileFull.kyc.usPersonHelp') }}
      </p>
      <label
        :class="[
          'flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
          themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white',
          isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        <span :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ $t('kyb.profileFull.kyc.usPerson') }}
        </span>
        <Toggle :active="usPerson" :disabled="isDisabled" @toggle="toggleUsPerson" />
      </label>
      <div v-if="usPerson" class="mt-4">
        <label for="kyc-usTaxId" :class="[fieldClass, labelCls]">{{ $t('kyb.profileFull.kyc.usTaxId') }}</label>
        <Input
          id="kyc-usTaxId"
          v-model="usTaxId"
          type="text"
          required
          aria-required="true"
          :placeholder="$t('kyb.profileFull.kyc.usTaxIdPlaceholder')"
          :aria-invalid="!!errors.usTaxId"
          :aria-describedby="errors.usTaxId ? 'kyc-usTaxId-error' : undefined"
          :disabled="isDisabled"
        />
        <p v-if="errors.usTaxId" id="kyc-usTaxId-error" role="alert" :class="errorClass">{{ errors.usTaxId }}</p>
      </div>
    </section>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
