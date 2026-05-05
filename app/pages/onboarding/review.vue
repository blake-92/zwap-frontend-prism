<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { motion } from 'motion-v'
import { Mail, ArrowLeft } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import ReviewBanner from '~/components/features/kyb/ReviewBanner.vue'
import { useThemeStore } from '~/stores/theme'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { useKybDraft } from '~/composables/kyb/useKybDraft'
import { ROUTES } from '~/utils/routes'
import { SPRING_SOFT } from '~/utils/springs'

definePageMeta({ layout: false })

const { t } = useI18n()
const themeStore = useThemeStore()
const api = useKybApi()
const draft = useKybDraft()

const currentState = ref('SUBMITTED') // optimista — el polling lo refresca al state real
const expired = ref(false)
const ownerEmail = ref('')

let poller = null

onMounted(async () => {
  // Sin draft → no hay nada que mostrar; mandar al start.
  if (!draft.hasDraft.value) {
    navigateTo(ROUTES.ONBOARDING_START, { replace: true })
    return
  }
  // Snapshot inicial: 1 GET para hidratar state + email.
  try {
    const app = await api.getApplication()
    currentState.value = app.state ?? 'SUBMITTED'
    ownerEmail.value = app.ownerEmail ?? ''
  } catch {
    expired.value = true
    return
  }
  // Polling 15s/30s back-off, visibility-aware. pollStatus de useKybApi maneja todo eso.
  poller = api.pollStatus({
    initialState: currentState.value,
    onChange: (app) => { currentState.value = app.state ?? currentState.value },
    onExpired: () => { expired.value = true },
  })
  poller.start()
})

onUnmounted(() => { poller?.stop() })

const lead = computed(() => {
  switch (currentState.value) {
    case 'SUBMITTED': return t('kyb.review.leadSubmitted')
    case 'IN_REVIEW': return t('kyb.review.leadInReview')
    case 'MORE_INFO_REQUIRED': return t('kyb.review.leadMoreInfo')
    case 'REJECTED': return t('kyb.review.leadRejected', { reason: '' })
    default: return t('kyb.review.leadSubmitted')
  }
})

function startOver() {
  draft.clear()
  navigateTo(ROUTES.ONBOARDING_START)
}

function backToWizardForMoreInfo() {
  navigateTo(ROUTES.ONBOARDING_STEP(1))
}
</script>

<template>
  <div :class="['min-h-dvh flex items-center justify-center p-4 sm:p-8', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <motion.main
      :class="[
        'w-full max-w-2xl rounded-3xl p-8 sm:p-12 backdrop-blur-2xl border',
        themeStore.isDarkMode
          ? 'bg-[#252429]/40 border-white/10 border-t-white/20 shadow-2xl'
          : 'bg-white/60 border-white shadow-[0_30px_80px_rgba(0,0,0,0.08)]',
      ]"
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="SPRING_SOFT"
    >
      <!-- Expired state -->
      <template v-if="expired">
        <h1 :class="['text-2xl sm:text-3xl font-bold tracking-tight mb-3', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ $t('kyb.review.expiredTitle') }}
        </h1>
        <p :class="['text-sm mb-8', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ $t('kyb.review.expiredBody') }}
        </p>
        <Button @click="startOver">{{ $t('kyb.review.expiredCta') }}</Button>
      </template>

      <!-- Active state -->
      <template v-else>
        <h1 :class="['text-2xl sm:text-3xl font-bold tracking-tight mb-6', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ $t('kyb.review.title') }}
        </h1>

        <ReviewBanner :kyb-state="currentState" class="mb-6" />

        <p :class="['text-sm mb-6 leading-relaxed', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
          {{ lead }}
        </p>

        <!-- Email reminder -->
        <div v-if="ownerEmail" :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium mb-6', themeStore.isDarkMode ? 'bg-[#111113]/50 text-[#888991]' : 'bg-white/40 text-[#67656E]']">
          <Mail :size="16" />
          {{ $t('kyb.review.checkEmailHelp', { email: ownerEmail }) }}
        </div>

        <!-- CTA contextual -->
        <div class="flex gap-3">
          <Button v-if="currentState === 'MORE_INFO_REQUIRED'" @click="backToWizardForMoreInfo">
            <ArrowLeft :size="14" class="mr-1.5" /> {{ $t('kyb.review.moreInfoCta') }}
          </Button>
          <Button v-if="currentState === 'REJECTED'" variant="outline" @click="startOver">
            {{ $t('kyb.review.rejectedCta') }}
          </Button>
        </div>
      </template>
    </motion.main>
  </div>
</template>
