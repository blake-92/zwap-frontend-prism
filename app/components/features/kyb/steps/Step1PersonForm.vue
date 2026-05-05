<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import { Mail, Phone, Calendar, Globe } from 'lucide-vue-next'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import Toggle from '~/components/ui/Toggle.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Pure controlled form. Emite 'submit' con payload válido; el WizardView lo agarra y llama
// useKybApi.patchStep1Person. Esto deja al form fácil de unit-testear sin tocar la API.
//
// `initial` permite hidratar el form con datos previos (recovery / volver atrás del stepper).
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  // El padre lo pone true mientras el PATCH está en flight para deshabilitar inputs / footer.
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

// Subset razonable de países LATAM + US/ES para el MVP. Si más adelante necesitamos catálogo
// global, lo extraemos a `~/utils/countries.js`. ISO 3166 alpha-2.
const COUNTRY_OPTIONS = [
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

const givenName = ref(props.initial.givenName ?? '')
const familyName = ref(props.initial.familyName ?? '')
const middleName = ref(props.initial.middleName ?? '')
const dateOfBirth = ref(props.initial.dateOfBirth ?? '')
const nationality = ref(props.initial.nationality ?? '')
const email = ref(props.initial.email ?? '')
const phone = ref(props.initial.phone ?? '')
const isPep = ref(Boolean(props.initial.isPep))
const isPepRelated = ref(Boolean(props.initial.isPepRelated))

// Errores per-field. Mantenidos como refs separados para que el binding `aria-describedby`
// apunte al span correcto sin lógica adicional.
const errors = ref({})

function validateAge(iso) {
  // iso = YYYY-MM-DD. Devuelve true si tiene ≥18 al día de hoy.
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const dob = new Date(iso)
  if (Number.isNaN(dob.getTime())) return null
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
    - ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0)
  return age >= 18
}

function validateEmail(v) {
  if (!v) return true // email es opcional en step1
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validatePhone(v) {
  if (!v) return true // phone es opcional
  return /^\+?[0-9]{7,20}$/.test(v.replace(/\s/g, ''))
}

function validate() {
  const next = {}
  if (!givenName.value.trim()) next.givenName = t('kyb.step1.errors.givenNameRequired')
  if (!familyName.value.trim()) next.familyName = t('kyb.step1.errors.familyNameRequired')
  if (!dateOfBirth.value) next.dateOfBirth = t('kyb.step1.errors.dateOfBirthRequired')
  else {
    const ageOk = validateAge(dateOfBirth.value)
    if (ageOk === null) next.dateOfBirth = t('kyb.step1.errors.dateOfBirthInvalid')
    else if (!ageOk) next.dateOfBirth = t('kyb.step1.errors.dateOfBirthUnderage')
  }
  if (!nationality.value) next.nationality = t('kyb.step1.errors.nationalityRequired')
  if (!validateEmail(email.value)) next.email = t('kyb.step1.errors.emailInvalid')
  if (!validatePhone(phone.value)) next.phone = t('kyb.step1.errors.phoneInvalid')
  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  const payload = {
    givenName: givenName.value.trim(),
    familyName: familyName.value.trim(),
    middleName: middleName.value.trim() || undefined,
    dateOfBirth: dateOfBirth.value,
    nationality: nationality.value,
    email: email.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
    isPep: isPep.value,
    isPepRelated: isPepRelated.value,
  }
  // Backend valida required: givenName/familyName/dateOfBirth/nationality/isPep/isPepRelated.
  // Optional: middleName/email/phone — los omitimos si vienen vacíos para no mandar "" inútil.
  return payload
}

function onSubmit() {
  if (!validate()) {
    // Foco al primer error para a11y.
    const firstErrField = Object.keys(errors.value)[0]
    if (firstErrField && typeof document !== 'undefined') {
      const el = document.getElementById(`step1-${firstErrField}`)
      el?.focus?.()
    }
    return
  }
  emit('submit', buildPayload())
}

// Padre usa watch en `change` para autosave (futuro). Por ahora solo lo emitimos
// como hook para que tests puedan validar reactividad sin tipear submit.
watch([givenName, familyName, middleName, dateOfBirth, nationality, email, phone, isPep, isPepRelated], () => {
  emit('change', buildPayload())
})

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = (key) => `block text-xs font-bold uppercase tracking-wide mb-2 ${labelCls.value}`
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
    <!-- Datos personales -->
    <section>
      <SectionLabel>{{ $t('kyb.step1.title') }}</SectionLabel>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        <div>
          <label :for="'step1-givenName'" :class="fieldClass()">{{ $t('kyb.step1.givenName') }}</label>
          <Input
            id="step1-givenName"
            v-model="givenName"
            type="text"
            required
            aria-required="true"
            :aria-invalid="!!errors.givenName"
            :aria-describedby="errors.givenName ? 'step1-givenName-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.givenName" id="step1-givenName-error" role="alert" :class="errorClass">
            {{ errors.givenName }}
          </p>
        </div>
        <div>
          <label :for="'step1-familyName'" :class="fieldClass()">{{ $t('kyb.step1.familyName') }}</label>
          <Input
            id="step1-familyName"
            v-model="familyName"
            type="text"
            required
            aria-required="true"
            :aria-invalid="!!errors.familyName"
            :aria-describedby="errors.familyName ? 'step1-familyName-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.familyName" id="step1-familyName-error" role="alert" :class="errorClass">
            {{ errors.familyName }}
          </p>
        </div>
        <div class="md:col-span-2">
          <label :for="'step1-middleName'" :class="fieldClass()">{{ $t('kyb.step1.middleNameOptional') }}</label>
          <Input
            id="step1-middleName"
            v-model="middleName"
            type="text"
            :disabled="submitting"
          />
        </div>
        <div>
          <label :for="'step1-dateOfBirth'" :class="fieldClass()">{{ $t('kyb.step1.dateOfBirth') }}</label>
          <input
            id="step1-dateOfBirth"
            v-model="dateOfBirth"
            type="date"
            required
            aria-required="true"
            :aria-invalid="!!errors.dateOfBirth"
            :aria-describedby="errors.dateOfBirth ? 'step1-dateOfBirth-error' : undefined"
            :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.dateOfBirth ? '!border-rose-500/60' : '']"
          >
          <p v-if="errors.dateOfBirth" id="step1-dateOfBirth-error" role="alert" :class="errorClass">
            {{ errors.dateOfBirth }}
          </p>
        </div>
        <div>
          <label :for="'step1-nationality'" :class="fieldClass()">{{ $t('kyb.step1.nationality') }}</label>
          <select
            id="step1-nationality"
            v-model="nationality"
            required
            aria-required="true"
            :aria-invalid="!!errors.nationality"
            :aria-describedby="errors.nationality ? 'step1-nationality-error' : undefined"
            :disabled="submitting"
            :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls, errors.nationality ? '!border-rose-500/60' : '']"
          >
            <option value="" disabled>{{ $t('kyb.step1.nationalityPlaceholder') }}</option>
            <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
          </select>
          <p v-if="errors.nationality" id="step1-nationality-error" role="alert" :class="errorClass">
            {{ errors.nationality }}
          </p>
        </div>
        <div>
          <label :for="'step1-email'" :class="fieldClass()">{{ $t('kyb.step1.email') }}</label>
          <Input
            id="step1-email"
            v-model="email"
            type="email"
            placeholder="ana@hotel.bo"
            :icon="Mail"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'step1-email-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.email" id="step1-email-error" role="alert" :class="errorClass">
            {{ errors.email }}
          </p>
        </div>
        <div>
          <label :for="'step1-phone'" :class="fieldClass()">{{ $t('kyb.step1.phoneOptional') }}</label>
          <Input
            id="step1-phone"
            v-model="phone"
            type="tel"
            :placeholder="$t('kyb.step1.phonePlaceholder')"
            :icon="Phone"
            :aria-invalid="!!errors.phone"
            :aria-describedby="errors.phone ? 'step1-phone-error' : undefined"
            :disabled="submitting"
          />
          <p v-if="errors.phone" id="step1-phone-error" role="alert" :class="errorClass">
            {{ errors.phone }}
          </p>
        </div>
      </div>
    </section>

    <!-- PEP -->
    <section>
      <SectionLabel>{{ $t('kyb.step1.pepSection') }}</SectionLabel>
      <p :class="['text-xs mt-2 mb-4 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.step1.pepHelp') }}
      </p>
      <div class="space-y-3">
        <label
          :class="[
            'flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
            themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white',
          ]"
        >
          <span :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
            {{ $t('kyb.step1.isPep') }}
          </span>
          <Toggle :active="isPep" @toggle="isPep = !isPep" />
        </label>
        <label
          :class="[
            'flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
            themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white',
          ]"
        >
          <span :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
            {{ $t('kyb.step1.isPepRelated') }}
          </span>
          <Toggle :active="isPepRelated" @toggle="isPepRelated = !isPepRelated" />
        </label>
      </div>
    </section>

    <!-- Submit hidden — el WizardView pone el botón en el footer y dispara via expose -->
    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
