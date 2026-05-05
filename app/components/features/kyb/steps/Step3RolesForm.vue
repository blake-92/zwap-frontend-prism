<script setup>
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Plus, Trash2, Briefcase, ShieldCheck, UserCheck, Pen } from 'lucide-vue-next'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING, SPRING_SOFT } from '~/utils/springs'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  // Necesario para el threshold de BO: 10% si entityType=NATURAL_PERSON, 25% otras.
  // El padre lo inyecta desde el state global del wizard (step2 ya completado).
  entityType: { type: String, default: 'OTHER' },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'change'])

const { t } = useI18n()
const themeStore = useThemeStore()

// El threshold de ownership para considerar a alguien "BO declarable":
// - Persona natural / unipersonal: 10%
// - Otras entidades: 25%
const boThreshold = computed(() => (props.entityType === 'NATURAL_PERSON' || props.entityType === 'SOLE_PROPRIETOR') ? 10 : 25)

const COUNTRY_OPTIONS = [
  { code: 'BO', label: 'Bolivia' }, { code: 'AR', label: 'Argentina' }, { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' }, { code: 'CO', label: 'Colombia' }, { code: 'EC', label: 'Ecuador' },
  { code: 'MX', label: 'México' }, { code: 'PE', label: 'Perú' }, { code: 'PY', label: 'Paraguay' },
  { code: 'UY', label: 'Uruguay' }, { code: 'US', label: 'Estados Unidos' }, { code: 'ES', label: 'España' },
]

const ROLE_META = {
  BENEFICIAL_OWNER: { icon: Briefcase, addKey: 'kyb.step3.addBo' },
  LEGAL_REPRESENTATIVE: { icon: ShieldCheck, addKey: 'kyb.step3.addRep' },
  DIRECTOR: { icon: UserCheck, addKey: 'kyb.step3.addDirector' },
  AUTHORIZED_SIGNATORY: { icon: Pen, addKey: 'kyb.step3.addSignatory' },
}

function makeBlank(role) {
  return {
    role,
    givenName: '',
    familyName: '',
    middleName: '',
    dateOfBirth: '',
    nationality: '',
    email: '',
    phone: '',
    ownershipPercentage: role === 'BENEFICIAL_OWNER' ? '' : null,
  }
}

const roles = ref(
  Array.isArray(props.initial.roles) && props.initial.roles.length > 0
    ? props.initial.roles.map((r) => ({ ...makeBlank(r.role ?? 'LEGAL_REPRESENTATIVE'), ...r }))
    : [makeBlank('LEGAL_REPRESENTATIVE')],
)

const errors = ref({}) // { __global: 'msg', [`role-${i}-field`]: 'msg' }

function add(roleCode) {
  roles.value.push(makeBlank(roleCode))
}

function removeAt(i) {
  roles.value.splice(i, 1)
  if (roles.value.length === 0) {
    // Garantizar al menos 1 entrada para que el form no quede vacío.
    roles.value.push(makeBlank('LEGAL_REPRESENTATIVE'))
  }
}

const totalOwnership = computed(() => {
  return roles.value
    .filter((r) => r.role === 'BENEFICIAL_OWNER')
    .reduce((sum, r) => {
      const pct = Number.parseFloat(r.ownershipPercentage)
      return sum + (Number.isFinite(pct) ? pct : 0)
    }, 0)
})

function validate() {
  const next = {}
  // Regla 1: al menos 1 LEGAL_REPRESENTATIVE.
  const hasRep = roles.value.some((r) => r.role === 'LEGAL_REPRESENTATIVE')
  if (!hasRep) next.__global = t('kyb.step3.errors.noLegalRep')

  // Regla 2: suma ownership ≤ 100.
  if (totalOwnership.value > 100) next.__global = t('kyb.step3.errors.ownershipExceeds')

  // Regla 3: per-row.
  roles.value.forEach((r, i) => {
    if (!r.givenName.trim() || !r.familyName.trim() || !r.dateOfBirth || !r.nationality) {
      next[`role-${i}-person`] = t('kyb.step3.errors.rolePersonIncomplete', { n: i + 1 })
    }
    if (r.role === 'BENEFICIAL_OWNER') {
      const pct = Number.parseFloat(r.ownershipPercentage)
      if (!Number.isFinite(pct)) {
        next[`role-${i}-ownership`] = t('kyb.step3.errors.ownershipMissing')
      } else if (pct < boThreshold.value) {
        next[`role-${i}-ownership`] = t('kyb.step3.errors.ownershipBelow')
      }
    }
  })

  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  return {
    roles: roles.value.map((r) => {
      const out = {
        role: r.role,
        givenName: r.givenName.trim() || undefined,
        familyName: r.familyName.trim() || undefined,
        middleName: r.middleName.trim() || undefined,
        dateOfBirth: r.dateOfBirth || undefined,
        nationality: r.nationality || undefined,
        email: r.email.trim() || undefined,
        phone: r.phone.trim() || undefined,
      }
      if (r.role === 'BENEFICIAL_OWNER' && r.ownershipPercentage !== '') {
        out.ownershipPercentage = Number.parseFloat(r.ownershipPercentage)
      }
      return out
    }),
  }
}

function onSubmit() {
  if (!validate()) return
  emit('submit', buildPayload())
}

watch(roles, () => { emit('change', buildPayload()) }, { deep: true })

defineExpose({ submit: onSubmit, validate, buildPayload, totalOwnership })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')

const cardCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/30 border-white/10'
  : 'bg-white/40 border-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]')

const ownershipPillCls = computed(() => {
  const t = totalOwnership.value
  if (t > 100) return 'bg-rose-500/15 text-rose-500'
  if (t === 100) return 'bg-emerald-500/15 text-emerald-500'
  return themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
})
</script>

<template>
  <motion.form
    novalidate
    class="space-y-6"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="SPRING_SOFT"
    @submit.prevent="onSubmit"
  >
    <!-- Suma de ownership total — pill chico arriba -->
    <div class="flex items-center justify-between">
      <SectionLabel>{{ $t('kyb.step3.title') }}</SectionLabel>
      <span :class="['text-xs font-bold px-3 py-1.5 rounded-full', ownershipPillCls]">
        {{ $t('kyb.step3.totalOwnership', { percent: totalOwnership.toFixed(2) }) }}
      </span>
    </div>

    <p v-if="errors.__global" role="alert" class="px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-medium">
      {{ errors.__global }}
    </p>

    <!-- Lista dinámica de roles -->
    <AnimatePresence>
      <motion.article
        v-for="(r, i) in roles"
        :key="`${r.role}-${i}-${r.givenName}-${r.familyName}`"
        :class="['p-5 rounded-2xl border space-y-5 backdrop-blur-md', cardCls]"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -8 }"
        :transition="SPRING"
      >
        <!-- Header: rol + remove -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-full flex items-center justify-center', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
              <component :is="ROLE_META[r.role]?.icon ?? ShieldCheck" :size="16" />
            </div>
            <select
              v-model="r.role"
              :disabled="submitting"
              :class="['rounded-xl border px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
            >
              <option v-for="(_, code) in ROLE_META" :key="code" :value="code">
                {{ $t(`kyb.step3.rolesLabels.${code}`) }}
              </option>
            </select>
          </div>
          <button
            type="button"
            :aria-label="$t('kyb.step3.removeRole')"
            :disabled="submitting || roles.length === 1"
            class="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            @click="removeAt(i)"
          >
            <Trash2 :size="16" />
          </button>
        </div>

        <!-- Datos persona -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.givenName') }}</label>
            <Input v-model="r.givenName" type="text" :disabled="submitting" />
          </div>
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.familyName') }}</label>
            <Input v-model="r.familyName" type="text" :disabled="submitting" />
          </div>
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.dateOfBirth') }}</label>
            <input v-model="r.dateOfBirth" type="date" :disabled="submitting" :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]">
          </div>
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.nationality') }}</label>
            <select v-model="r.nationality" :disabled="submitting" :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]">
              <option value="" disabled>{{ $t('kyb.step1.nationalityPlaceholder') }}</option>
              <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
            </select>
          </div>
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.email') }}</label>
            <Input v-model="r.email" type="email" :disabled="submitting" />
          </div>
          <div>
            <label :class="[fieldClass, labelCls]">{{ $t('kyb.step1.phoneOptional') }}</label>
            <Input v-model="r.phone" type="tel" :placeholder="$t('kyb.step1.phonePlaceholder')" :disabled="submitting" />
          </div>
        </div>
        <p v-if="errors[`role-${i}-person`]" role="alert" :class="errorClass">
          {{ errors[`role-${i}-person`] }}
        </p>

        <!-- Ownership solo si es BO -->
        <div v-if="r.role === 'BENEFICIAL_OWNER'" class="pt-2 border-t border-white/5">
          <label :class="[fieldClass, labelCls]">{{ $t('kyb.step3.ownershipLabel') }}</label>
          <div class="flex items-baseline gap-2">
            <Input
              v-model="r.ownershipPercentage"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              class="max-w-[160px]"
              :disabled="submitting"
              :aria-invalid="!!errors[`role-${i}-ownership`]"
            />
            <span :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">%</span>
          </div>
          <p :class="['text-xs mt-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ $t('kyb.step3.ownershipHelp') }} (≥{{ boThreshold }}%)
          </p>
          <p v-if="errors[`role-${i}-ownership`]" role="alert" :class="errorClass">
            {{ errors[`role-${i}-ownership`] }}
          </p>
        </div>
      </motion.article>
    </AnimatePresence>

    <!-- Add buttons -->
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" type="button" :disabled="submitting" @click="add('BENEFICIAL_OWNER')">
        <Plus :size="14" class="mr-1.5" /> {{ $t('kyb.step3.addBo') }}
      </Button>
      <Button variant="outline" type="button" :disabled="submitting" @click="add('LEGAL_REPRESENTATIVE')">
        <Plus :size="14" class="mr-1.5" /> {{ $t('kyb.step3.addRep') }}
      </Button>
      <Button variant="ghost" type="button" :disabled="submitting" @click="add('DIRECTOR')">
        <Plus :size="14" class="mr-1.5" /> {{ $t('kyb.step3.addDirector') }}
      </Button>
      <Button variant="ghost" type="button" :disabled="submitting" @click="add('AUTHORIZED_SIGNATORY')">
        <Plus :size="14" class="mr-1.5" /> {{ $t('kyb.step3.addSignatory') }}
      </Button>
    </div>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
