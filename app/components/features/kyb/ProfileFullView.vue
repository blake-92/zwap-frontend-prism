<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { User, Building2, FileText, Send, Lock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-vue-next'
import Stepper from '~/components/ui/Stepper.vue'
import Button from '~/components/ui/Button.vue'
import KybStepHeader from '~/components/features/kyb/shared/KybStepHeader.vue'
import KycFullForm from '~/components/features/kyb/ProfileFullSteps/KycFullForm.vue'
import KybFullForm from '~/components/features/kyb/ProfileFullSteps/KybFullForm.vue'
import BusinessProfileForm from '~/components/features/kyb/ProfileFullSteps/BusinessProfileForm.vue'
import MoreInfoRequestedAlert from '~/components/features/kyb/MoreInfoRequestedAlert.vue'
import ReviewBanner from '~/components/features/kyb/ReviewBanner.vue'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useSessionStore } from '~/stores/session'
import { useProfileFullStore } from '~/stores/profileFull'
import { useProfileFullApi } from '~/composables/kyb/useProfileFullApi'
import { ApiError } from '~/utils/api'
import { SPRING_SOFT } from '~/utils/springs'

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const sessionStore = useSessionStore()
const profileStore = useProfileFullStore()
const api = useProfileFullApi()

// Step actual: 1 = KYC FULL, 2 = KYB FULL (per primary entity), 3 = Business Profile.
// Mantenemos el step en local — esta page no usa router dinámico (todo en una sola URL),
// la nav es por step number interno.
const step = ref(1)
const totalSteps = 3

// Permission gating: SETTINGS_MERCHANT habilita PATCH entity/business y submit. KYC del
// person SIEMPRE es editable por su dueño (no requiere permiso adicional).
const canEditMerchant = computed(() => sessionStore.hasPermission('SETTINGS_MERCHANT'))

const formRef = ref(null)
const submittingStep = ref(false)
const submitErrorMsg = ref('')

let poller = null

onMounted(async () => {
  try {
    await profileStore.fetch()
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // No tiene Person VERIFIED → backend devuelve 404. Caso raro post-aprobación BASIC,
      // pero defensivo: mostramos toast informativo en lugar de crash.
      toastStore.addToast(t('kyb.profileFull.errors.noPermissionEdit'), 'error', 4000)
    } else if (err instanceof ApiError) {
      toastStore.addToast(err.message ?? t('kyb.errors.generic'), 'error', 4000)
    } else {
      toastStore.addToast(t('kyb.errors.generic'), 'error', 4000)
    }
  }

  // Si business profile está SUBMITTED|IN_REVIEW, arrancamos polling para actualizar status.
  if (['SUBMITTED', 'IN_REVIEW'].includes(profileStore.businessProfileStatus)) {
    poller = api.pollBusinessProfile({
      initialState: profileStore.businessProfileStatus,
      onChange: (bp) => { profileStore.businessProfile = bp },
      onError: () => { /* silencio — el banner sigue mostrando el último estado conocido */ },
    })
    poller.start()
  }
})

onUnmounted(() => { poller?.stop() })

const stepperSteps = computed(() => {
  const arr = [
    { label: t('kyb.profileFull.stepKycLabel'), sub: t('kyb.profileFull.stepKycSub'), icon: User },
    { label: t('kyb.profileFull.stepKybLabel'), sub: t('kyb.profileFull.stepKybSub'), icon: Building2 },
    { label: t('kyb.profileFull.stepBusinessLabel'), sub: t('kyb.profileFull.stepBusinessSub'), icon: FileText },
  ]
  return arr.map((s, i) => ({ ...s, done: i < step.value - 1, active: i === step.value - 1 }))
})

const STEP_TITLES = {
  1: 'kyb.profileFull.kyc.title',
  2: 'kyb.profileFull.kyb.title',
  3: 'kyb.profileFull.business.title',
}
const STEP_DESCS = {
  1: 'kyb.profileFull.kyc.description',
  2: 'kyb.profileFull.kyb.description',
  3: 'kyb.profileFull.business.description',
}

const showBanner = computed(() => ['SUBMITTED', 'IN_REVIEW', 'MORE_INFO_REQUIRED', 'REJECTED'].includes(profileStore.businessProfileStatus))
const isReviewLocked = computed(() => ['SUBMITTED', 'IN_REVIEW', 'APPROVED'].includes(profileStore.businessProfileStatus))

async function handleKycSubmit(payload) {
  submitErrorMsg.value = ''
  submittingStep.value = true
  try {
    await profileStore.patchPerson(payload)
    toastStore.addToast(t('kyb.profileFull.saveSuccess'), 'success', 2500)
    step.value = 2
  } catch (err) {
    submitErrorMsg.value = err instanceof ApiError ? err.message : t('kyb.errors.generic')
  } finally {
    submittingStep.value = false
  }
}

async function handleKybSubmit({ entityId, payload }) {
  submitErrorMsg.value = ''
  submittingStep.value = true
  try {
    await profileStore.patchEntity(entityId, payload)
    toastStore.addToast(t('kyb.profileFull.saveSuccess'), 'success', 2500)
    step.value = 3
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      submitErrorMsg.value = t('kyb.profileFull.errors.noPermissionEdit')
    } else {
      submitErrorMsg.value = err instanceof ApiError ? err.message : t('kyb.errors.generic')
    }
  } finally {
    submittingStep.value = false
  }
}

async function handleBusinessSubmit(payload) {
  submitErrorMsg.value = ''
  submittingStep.value = true
  try {
    await profileStore.putBusinessProfile(payload)
    toastStore.addToast(t('kyb.profileFull.saveSuccess'), 'success', 2500)
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      submitErrorMsg.value = t('kyb.profileFull.errors.businessProfileLocked')
    } else if (err instanceof ApiError && err.status === 403) {
      submitErrorMsg.value = t('kyb.profileFull.errors.noPermissionEdit')
    } else {
      submitErrorMsg.value = err instanceof ApiError ? err.message : t('kyb.errors.generic')
    }
  } finally {
    submittingStep.value = false
  }
}

function triggerStepSubmit() {
  formRef.value?.submit?.()
}

async function handleSubmitForFull() {
  submitErrorMsg.value = ''
  submittingStep.value = true
  try {
    await profileStore.submitForFull()
    toastStore.addToast(t('kyb.profileFull.saveSuccess'), 'success', 3500)
    // Restart polling para que el banner se actualice cuando back-office decida.
    poller?.stop()
    poller = api.pollBusinessProfile({
      initialState: profileStore.businessProfileStatus,
      onChange: (bp) => { profileStore.businessProfile = bp },
    })
    poller.start()
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      submitErrorMsg.value = err.message ?? t('kyb.profileFull.errors.submitNeedsResidentialAddress')
    } else if (err instanceof ApiError && err.status === 403) {
      submitErrorMsg.value = t('kyb.profileFull.errors.noPermissionSubmit')
    } else {
      submitErrorMsg.value = err instanceof ApiError ? err.message : t('kyb.errors.generic')
    }
  } finally {
    submittingStep.value = false
  }
}

const submitDisabledReason = computed(() => {
  if (!canEditMerchant.value) return t('kyb.profileFull.errors.noPermissionSubmit')
  if (!profileStore.canSubmit) return t('kyb.profileFull.submitDisabledIncomplete')
  return ''
})

const cardCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#252429]/40 border-white/10 border-t-white/20 shadow-2xl backdrop-blur-2xl'
  : 'bg-white/60 border-white shadow-[0_30px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl')
</script>

<template>
  <section class="max-w-4xl mx-auto">
    <!-- Page header -->
    <header class="mb-6 sm:mb-8">
      <h1 :class="['text-2xl sm:text-3xl font-bold tracking-tight mb-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        {{ $t('kyb.profileFull.pageTitle') }}
      </h1>
      <p :class="['text-sm', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.profileFull.pageSubtitle') }}
      </p>
    </header>

    <!-- Banner condicional según business profile status -->
    <ReviewBanner v-if="showBanner" :kyb-state="profileStore.businessProfileStatus" class="mb-6" />

    <!-- MoreInfoRequested si aplica -->
    <MoreInfoRequestedAlert v-if="profileStore.moreInfoRequested" :data="profileStore.moreInfoRequested" class="mb-6" />

    <!-- Read-only banner si no tiene SETTINGS_MERCHANT y está en step KYB/business -->
    <div v-if="!canEditMerchant && step >= 2" :class="['mb-6 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium', themeStore.isDarkMode ? 'bg-white/5 text-[#888991]' : 'bg-black/5 text-[#67656E]']">
      <Lock :size="16" />
      {{ $t('kyb.profileFull.viewOnly') }}
    </div>

    <!-- Loading state -->
    <div v-if="profileStore.loading || profileStore.bpLoading" :class="['rounded-2xl p-8 text-center text-sm font-medium', cardCls, themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
      {{ $t('kyb.profileFull.loadingProfile') }}
    </div>

    <template v-else>
      <!-- Stepper -->
      <div class="mb-6 sm:mb-8">
        <Stepper :steps="stepperSteps" aria-list :step-label-template="$t('kyb.stepper.stepAriaLabel')" />
      </div>

      <KybStepHeader
        :title="$t(STEP_TITLES[step])"
        :description="$t(STEP_DESCS[step])"
        :step="step"
        :total="totalSteps"
      />

      <article :class="['rounded-2xl p-6 sm:p-8', cardCls]">
        <AnimatePresence mode="wait">
          <motion.div
            :key="step"
            :initial="{ opacity: 0, x: 12 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -12 }"
            :transition="SPRING_SOFT"
          >
            <!-- Step 1: KYC FULL -->
            <KycFullForm
              v-if="step === 1"
              ref="formRef"
              :initial="profileStore.person ?? {}"
              :is-pep="Boolean(profileStore.person?.isPep)"
              :is-pep-related="Boolean(profileStore.person?.isPepRelated)"
              :submitting="submittingStep"
              @submit="handleKycSubmit"
            />

            <!-- Step 2: KYB FULL del primary entity -->
            <KybFullForm
              v-else-if="step === 2 && profileStore.primaryEntity"
              ref="formRef"
              :entity="profileStore.primaryEntity"
              :readonly="!canEditMerchant"
              :submitting="submittingStep"
              @submit="handleKybSubmit"
            />

            <!-- Step 3: BusinessProfile -->
            <BusinessProfileForm
              v-else-if="step === 3"
              ref="formRef"
              :initial="profileStore.businessProfile ?? {}"
              :readonly="!canEditMerchant || isReviewLocked"
              :submitting="submittingStep"
              @submit="handleBusinessSubmit"
            />
          </motion.div>
        </AnimatePresence>
      </article>

      <p v-if="submitErrorMsg" role="alert" class="mt-6 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-medium">
        {{ submitErrorMsg }}
      </p>

      <!-- Footer nav: Volver / Continuar / Enviar -->
      <div class="mt-8 flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" :disabled="submittingStep || step === 1" @click="step = step - 1">
          <ChevronLeft :size="16" class="mr-1" /> {{ $t('kyb.wizard.backCta') }}
        </Button>

        <div class="flex items-center gap-3">
          <!-- Botón submit-for-full visible solo en step 3 -->
          <Button
            v-if="step === 3"
            variant="default"
            :disabled="submittingStep || !canEditMerchant || !profileStore.canSubmit || isReviewLocked"
            :title="submitDisabledReason"
            @click="handleSubmitForFull"
          >
            <span v-if="submittingStep">{{ $t('kyb.profileFull.submittingFor') }}</span>
            <template v-else>
              {{ $t('kyb.profileFull.submitCta') }}
              <Send :size="14" class="ml-2" />
            </template>
          </Button>

          <Button v-if="step !== 3" variant="default" :disabled="submittingStep" @click="triggerStepSubmit">
            <span v-if="submittingStep">{{ $t('kyb.profileFull.savingChanges') }}</span>
            <template v-else>
              {{ $t('kyb.wizard.saveAndContinue') }}
              <ChevronRight :size="16" class="ml-1" />
            </template>
          </Button>

          <Button v-if="step === 3" variant="outline" :disabled="submittingStep || !canEditMerchant || isReviewLocked" @click="triggerStepSubmit">
            {{ $t('common.save') }}
          </Button>
        </div>
      </div>
    </template>
  </section>
</template>
