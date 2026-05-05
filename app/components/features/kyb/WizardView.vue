<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { ChevronLeft, ChevronRight, Send, User, Briefcase, Users, PlusCircle, Building2, FileText } from 'lucide-vue-next'
import Stepper from '~/components/ui/Stepper.vue'
import Button from '~/components/ui/Button.vue'
import Toggle from '~/components/ui/Toggle.vue'
import KybStepHeader from '~/components/features/kyb/shared/KybStepHeader.vue'
import Step1PersonForm from '~/components/features/kyb/steps/Step1PersonForm.vue'
import Step2EntityForm from '~/components/features/kyb/steps/Step2EntityForm.vue'
import Step3RolesForm from '~/components/features/kyb/steps/Step3RolesForm.vue'
import Step4AdditionalEntityForm from '~/components/features/kyb/steps/Step4AdditionalEntityForm.vue'
import Step5MerchantForm from '~/components/features/kyb/steps/Step5MerchantForm.vue'
import DocumentUploadStep from '~/components/features/kyb/steps/DocumentUploadStep.vue'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { useKybDraft } from '~/composables/kyb/useKybDraft'
import { ApiError } from '~/utils/api'
import { ROUTES } from '~/utils/routes'
import { SPRING_SOFT } from '~/utils/springs'

// El step actual viene del padre via prop (controlado por la ruta /onboarding/[step]).
// Total esperado: 1..6 (5 pasos del wizard + step de documentos final, equivalente al "step-6"
// en la UI aunque el backend lo maneja como uploads independientes).
const props = defineProps({
  step: { type: Number, required: true, validator: (v) => v >= 1 && v <= 6 },
  // Datos pre-cargados del draft (cuando hace recovery del GET /api/kyb/{id}). El wizard view
  // los usa para hidratar los forms. Forma libre — cada step usa lo que necesita.
  draftData: { type: Object, default: () => ({}) },
})
const emit = defineEmits([
  // Emitido cuando un step se guardó OK; el caller cambia la ruta al próximo step.
  'stepSaved',
  // Emitido cuando el user clickea "back" en el stepper o footer.
  'stepBack',
  // Emitido cuando el último submit es OK; el caller redirige a /onboarding/review.
  'submitted',
])

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const api = useKybApi()
const draft = useKybDraft()

// State del wizard — espejo de los payloads de cada step. Persistir en memoria para el go-back
// del stepper. Recovery (GET /api/kyb/{id}) se hace en la page parent y entra via draftData.
const state = reactive({
  step1: { ...(props.draftData.step1 ?? {}) },
  step2: { ...(props.draftData.step2 ?? {}) },
  step3: { ...(props.draftData.step3 ?? {}) },
  step4: { ...(props.draftData.step4 ?? {}) },
  step5: { ...(props.draftData.step5 ?? {}) },
  documents: { uploadsByKey: {} },
})

const submitting = ref(false)
const errorMsg = ref('')
const includeStep4 = ref(false) // Toggle "agregar entidad adicional"

// Stepper config — íconos + labels i18n. ariaList=true para WCAG.
const stepperSteps = computed(() => {
  const stepsArr = [
    { label: t('kyb.stepper.step1Label'), sub: t('kyb.stepper.step1Sub'), icon: User },
    { label: t('kyb.stepper.step2Label'), sub: t('kyb.stepper.step2Sub'), icon: Briefcase },
    { label: t('kyb.stepper.step3Label'), sub: t('kyb.stepper.step3Sub'), icon: Users },
    // Step 4 (entidad adicional) opcional — si no se usa, lo skipeamos visualmente.
    ...(includeStep4.value
      ? [{ label: t('kyb.stepper.step4Label'), sub: t('kyb.stepper.step4Sub'), icon: PlusCircle }]
      : []),
    { label: t('kyb.stepper.step5Label'), sub: t('kyb.stepper.step5Sub'), icon: Building2 },
    { label: t('kyb.stepper.step6Label'), sub: t('kyb.stepper.step6Sub'), icon: FileText },
  ]
  // Marcar done/active según props.step. step1=index 0, step2=1, step3=2, etc.
  const visualIndex = visualStepIndex(props.step)
  return stepsArr.map((s, i) => ({ ...s, done: i < visualIndex, active: i === visualIndex }))
})

// El step "5" del wizard puede ser el step5 visual o step5+1 si se incluyó el step4.
function visualStepIndex(stepNum) {
  // step 1, 2, 3 → indices 0, 1, 2
  // step 4 → 3 (solo si includeStep4)
  // step 5 → 3 si !includeStep4, 4 si sí
  // step 6 (uploads) → 4 si !includeStep4, 5 si sí
  if (stepNum <= 3) return stepNum - 1
  if (stepNum === 4) return 3
  if (stepNum === 5) return includeStep4.value ? 4 : 3
  if (stepNum === 6) return includeStep4.value ? 5 : 4
  return 0
}

const totalSteps = computed(() => includeStep4.value ? 6 : 5)
const visualStepNum = computed(() => visualStepIndex(props.step) + 1)

// Map de step number → component
const STEP_COMPONENTS = {
  1: Step1PersonForm,
  2: Step2EntityForm,
  3: Step3RolesForm,
  4: Step4AdditionalEntityForm,
  5: Step5MerchantForm,
  6: DocumentUploadStep,
}

const STEP_TITLES = {
  1: 'kyb.step1.title', 2: 'kyb.step2.title', 3: 'kyb.step3.title',
  4: 'kyb.step4.title', 5: 'kyb.step5.title', 6: 'kyb.step6.title',
}
const STEP_DESCS = {
  1: 'kyb.step1.description', 2: 'kyb.step2.description', 3: 'kyb.step3.description',
  4: 'kyb.step4.description', 5: 'kyb.step5.description', 6: 'kyb.step6.description',
}

const currentForm = ref(null)

async function handleSubmit(payload) {
  errorMsg.value = ''
  submitting.value = true
  try {
    let saved
    switch (props.step) {
      case 1: saved = await api.patchStep1Person(payload); state.step1 = payload; break
      case 2: saved = await api.patchStep2Entity(payload); state.step2 = payload; break
      case 3: saved = await api.patchStep3Roles(payload); state.step3 = payload; break
      case 4: saved = await api.patchStep4AdditionalEntity(payload); state.step4 = payload; break
      case 5: saved = await api.patchStep5Merchant(payload); state.step5 = payload; break
      case 6: {
        // El step 6 NO patchea — emite los uploads directos durante el step. Acá solo disparamos submit.
        await api.submit()
        emit('submitted')
        return
      }
    }
    // Avanzar al siguiente step. Si estamos en step3 y el user no quiere step4, saltamos a step5.
    let nextStep = props.step + 1
    if (props.step === 3 && !includeStep4.value) nextStep = 5
    emit('stepSaved', { step: props.step, nextStep, payload })
  } catch (err) {
    handleApiError(err)
  } finally {
    submitting.value = false
  }
}

function handleApiError(err) {
  if (!(err instanceof ApiError)) {
    errorMsg.value = t('kyb.errors.generic')
    return
  }
  const code = err.code
  // Mapeo a copy de UX. Si el code está en kyb.errors.*, usar eso. Sino fallback a generic.
  const knownCodes = ['kyb_application_not_found', 'kyb_invalid_state', 'kyb_invalid_data', 'kyb_file_too_large', 'kyb_missing_part']
  if (knownCodes.includes(code)) {
    errorMsg.value = t(`kyb.errors.${code}`, { detail: err.message })
  } else if (err.status === 429) {
    errorMsg.value = t('kyb.errors.rate_limit')
  } else if (err.status === 404 && code === 'kyb_application_not_found') {
    // Draft expirado — limpiar y mandar a /onboarding/start.
    draft.clear()
    toastStore.addToast(t('kyb.wizard.draftExpired'), 'error', 5000)
    navigateTo(ROUTES.ONBOARDING_START)
    return
  } else {
    errorMsg.value = t('kyb.errors.generic')
  }
  toastStore.addToast(errorMsg.value, 'error', 5000)
}

function triggerSubmit() {
  // El form expone submit() via defineExpose — llamamos para que valide + emita.
  // Step 6 es especial: no tiene form expuesto, en cambio es "submit del wizard".
  if (props.step === 6) {
    handleSubmit({}) // payload vacío — submit() del wizard
    return
  }
  currentForm.value?.submit?.()
}

function goBack() {
  if (props.step === 1) return // primer step, no hay back
  let prev = props.step - 1
  if (props.step === 5 && !includeStep4.value) prev = 3
  if (props.step === 6 && !includeStep4.value) prev = 5
  emit('stepBack', { from: props.step, to: prev })
}

const submitLabel = computed(() => props.step === 6 ? t('kyb.wizard.submitCta') : t('kyb.wizard.continueCta'))
const canSubmit = computed(() => {
  if (props.step !== 6) return true
  return currentForm.value?.allDone === true || currentForm.value?.allDone?.value === true
})

// El initial de cada form son los datos del state. Pasamos el slice correcto.
const initialForCurrentStep = computed(() => {
  switch (props.step) {
    case 1: return state.step1
    case 2: return state.step2
    case 3: return state.step3
    case 4: return state.step4
    case 5: return state.step5
    case 6: return state.documents
    default: return {}
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- Stepper -->
    <div class="mb-8 sm:mb-12">
      <Stepper
        :steps="stepperSteps"
        aria-list
        :step-label-template="$t('kyb.stepper.stepAriaLabel')"
      />
    </div>

    <!-- Header del step actual -->
    <KybStepHeader
      :title="$t(STEP_TITLES[step])"
      :description="$t(STEP_DESCS[step])"
      :step="visualStepNum"
      :total="totalSteps"
    />

    <!-- Toggle "agregar entidad adicional" — solo visible en step3 -->
    <div v-if="step === 3" class="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border" :class="themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-white/40 border-white'">
      <div>
        <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ $t('kyb.step4.title') }}
        </p>
        <p :class="['text-xs', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ $t('kyb.step4.description') }}
        </p>
      </div>
      <Toggle :active="includeStep4" @toggle="includeStep4 = !includeStep4" />
    </div>

    <!-- Step content (transition entre steps) -->
    <AnimatePresence mode="wait">
      <motion.div
        :key="step"
        :initial="{ opacity: 0, x: 16 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: -16 }"
        :transition="SPRING_SOFT"
      >
        <component
          :is="STEP_COMPONENTS[step]"
          ref="currentForm"
          :initial="initialForCurrentStep"
          :submitting="submitting"
          :entity-type="state.step2?.entityType ?? 'OTHER'"
          @submit="handleSubmit"
        />
      </motion.div>
    </AnimatePresence>

    <!-- Error message -->
    <p v-if="errorMsg" role="alert" class="mt-6 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-medium">
      {{ errorMsg }}
    </p>

    <!-- Footer nav -->
    <div class="mt-8 sm:mt-10 flex items-center justify-between gap-3">
      <Button
        variant="ghost"
        :disabled="submitting || step === 1"
        @click="goBack"
      >
        <ChevronLeft :size="16" class="mr-1" /> {{ $t('kyb.wizard.backCta') }}
      </Button>
      <Button
        variant="default"
        :disabled="submitting || (step === 6 && !canSubmit)"
        @click="triggerSubmit"
      >
        <span v-if="submitting">{{ $t('kyb.wizard.savingChanges') }}</span>
        <template v-else>
          {{ submitLabel }}
          <ChevronRight v-if="step !== 6" :size="16" class="ml-1" />
          <Send v-else :size="14" class="ml-2" />
        </template>
      </Button>
    </div>
  </div>
</template>
