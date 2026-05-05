<script setup>
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Plus, Trash2, MapPin, Building2 } from 'lucide-vue-next'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { SPRING, SPRING_SOFT } from '~/utils/springs'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
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

function makeBlankBranch() {
  return {
    name: '',
    address: { street: '', city: '', region: '', postalCode: '', country: '' },
  }
}

const displayName = ref(props.initial.displayName ?? '')
const branches = ref(
  Array.isArray(props.initial.branches) && props.initial.branches.length > 0
    ? props.initial.branches.map((b) => ({
        name: b.name ?? '',
        address: { street: '', city: '', region: '', postalCode: '', country: '', ...(b.address ?? {}) },
      }))
    : [makeBlankBranch()],
)

const errors = ref({})

function add() { branches.value.push(makeBlankBranch()) }
function removeAt(i) {
  branches.value.splice(i, 1)
  if (branches.value.length === 0) branches.value.push(makeBlankBranch())
}

function validate() {
  const next = {}
  if (!displayName.value.trim()) next.displayName = t('kyb.step5.errors.displayNameRequired')
  if (branches.value.length === 0) next.__global = t('kyb.step5.errors.noBranches')
  branches.value.forEach((b, i) => {
    const a = b.address
    if (!a.street?.trim() || !a.city?.trim() || !a.country) {
      next[`branch-${i}-address`] = t('kyb.step5.errors.addressIncomplete')
    }
  })
  errors.value = next
  return Object.keys(next).length === 0
}

function buildPayload() {
  return {
    displayName: displayName.value.trim(),
    branches: branches.value.map((b) => ({
      name: b.name.trim() || undefined,
      address: {
        street: b.address.street.trim(),
        city: b.address.city.trim(),
        country: b.address.country,
        region: b.address.region?.trim() || undefined,
        postalCode: b.address.postalCode?.trim() || undefined,
      },
    })),
  }
}

function onSubmit() {
  if (!validate()) return
  emit('submit', buildPayload())
}

watch([displayName, branches], () => { emit('change', buildPayload()) }, { deep: true })

defineExpose({ submit: onSubmit, validate, buildPayload })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const errorClass = 'text-rose-500 text-xs font-medium mt-1.5'
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')
const cardCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/30 border-white/10'
  : 'bg-white/40 border-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]')
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
    <!-- displayName -->
    <section>
      <SectionLabel>{{ $t('kyb.step5.title') }}</SectionLabel>
      <div class="mt-3 max-w-xl">
        <label for="step5-displayName" :class="[fieldClass, labelCls]">{{ $t('kyb.step5.displayName') }}</label>
        <Input
          id="step5-displayName"
          v-model="displayName"
          type="text"
          required
          aria-required="true"
          :placeholder="$t('kyb.step5.displayNamePlaceholder')"
          :icon="Building2"
          :aria-invalid="!!errors.displayName"
          :aria-describedby="errors.displayName ? 'step5-displayName-error' : undefined"
          :disabled="submitting"
        />
        <p :class="['text-xs mt-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ $t('kyb.step5.displayNameHelp') }}
        </p>
        <p v-if="errors.displayName" id="step5-displayName-error" role="alert" :class="errorClass">
          {{ errors.displayName }}
        </p>
      </div>
    </section>

    <!-- Branches -->
    <section>
      <div class="flex items-baseline justify-between mb-2">
        <SectionLabel>{{ $t('kyb.step5.branchesSection') }}</SectionLabel>
        <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
          {{ branches.length }}
        </span>
      </div>
      <p :class="['text-xs leading-relaxed mb-4', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.step5.branchesHelp') }}
      </p>

      <p v-if="errors.__global" role="alert" class="px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-medium mb-4">
        {{ errors.__global }}
      </p>

      <AnimatePresence>
        <motion.article
          v-for="(b, i) in branches"
          :key="`branch-${i}`"
          :class="['p-5 rounded-2xl border space-y-5 backdrop-blur-md mb-4', cardCls]"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -8 }"
          :transition="SPRING"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
                <MapPin :size="16" />
              </div>
              <div class="flex-1">
                <Input
                  v-model="b.name"
                  type="text"
                  :placeholder="$t('kyb.step5.branchNamePlaceholder')"
                  :disabled="submitting"
                />
              </div>
            </div>
            <button
              type="button"
              :aria-label="$t('kyb.step5.removeBranch')"
              :disabled="submitting || branches.length === 1"
              class="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              @click="removeAt(i)"
            >
              <Trash2 :size="16" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressStreet') }}</label>
              <Input v-model="b.address.street" type="text" required :disabled="submitting" />
            </div>
            <div>
              <label :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCity') }}</label>
              <Input v-model="b.address.city" type="text" required :disabled="submitting" />
            </div>
            <div>
              <label :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressRegionOptional') }}</label>
              <Input v-model="b.address.region" type="text" :disabled="submitting" />
            </div>
            <div>
              <label :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressPostalCodeOptional') }}</label>
              <Input v-model="b.address.postalCode" type="text" :disabled="submitting" />
            </div>
            <div>
              <label :class="[fieldClass, labelCls]">{{ $t('kyb.step5.addressCountry') }}</label>
              <select v-model="b.address.country" required :disabled="submitting"
                :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
              >
                <option value="" disabled>{{ $t('kyb.step1.nationalityPlaceholder') }}</option>
                <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.label }} ({{ c.code }})</option>
              </select>
            </div>
          </div>
          <p v-if="errors[`branch-${i}-address`]" role="alert" :class="errorClass">
            {{ errors[`branch-${i}-address`] }}
          </p>
        </motion.article>
      </AnimatePresence>

      <Button variant="outline" type="button" :disabled="submitting" @click="add">
        <Plus :size="14" class="mr-1.5" /> {{ $t('kyb.step5.addBranch') }}
      </Button>
    </section>

    <button type="submit" class="sr-only" aria-hidden="true" tabindex="-1">{{ $t('kyb.wizard.continueCta') }}</button>
  </motion.form>
</template>
