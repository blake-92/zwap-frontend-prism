<script setup>
import { computed, ref, onMounted } from 'vue'
import WizardView from '~/components/features/kyb/WizardView.vue'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { useKybDraft } from '~/composables/kyb/useKybDraft'
import { ApiError } from '~/utils/api'
import { ROUTES } from '~/utils/routes'

definePageMeta({ layout: false })

const route = useRoute()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const api = useKybApi()
const draft = useKybDraft()
const { t } = useI18n()

// param viene como 'step-1', 'step-2', etc. Parseamos al número.
const stepNum = computed(() => {
  const m = String(route.params.step ?? '').match(/^step-(\d)$/)
  const n = m ? Number.parseInt(m[1], 10) : 1
  return n >= 1 && n <= 6 ? n : 1
})

// Si no hay draft activo, redirigimos a /onboarding/start. El user pudo entrar via URL directa.
onMounted(() => {
  if (!draft.hasDraft.value) {
    navigateTo(ROUTES.ONBOARDING_START, { replace: true })
  }
})

const draftData = ref({})
// Recovery futuro: aquí podríamos llamar api.getApplication() para hidratar state desde backend.
// Por ahora, el state vive en memoria del WizardView (suficiente para una sesión continua sin
// reload entre steps). Si el user reloadea, los forms quedan vacíos pero el draft + applicationToken
// siguen — el backend conserva los PATCH previos del lado server.

function onStepSaved({ nextStep }) {
  navigateTo(ROUTES.ONBOARDING_STEP(nextStep))
}

function onStepBack({ to }) {
  navigateTo(ROUTES.ONBOARDING_STEP(to))
}

function onSubmitted() {
  navigateTo(ROUTES.ONBOARDING_REVIEW)
}
</script>

<template>
  <div :class="['min-h-dvh', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <WizardView
      :step="stepNum"
      :draft-data="draftData"
      @step-saved="onStepSaved"
      @step-back="onStepBack"
      @submitted="onSubmitted"
    />
  </div>
</template>
