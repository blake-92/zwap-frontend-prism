<script setup>
import { ref, computed, onMounted } from 'vue'
import { motion } from 'motion-v'
import { ArrowRight, FileCheck, Camera, Building2, Clock, ShieldCheck } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { useKybDraft } from '~/composables/kyb/useKybDraft'
import { ApiError } from '~/utils/api'
import { ROUTES } from '~/utils/routes'
import { SPRING_SOFT } from '~/utils/springs'

definePageMeta({ layout: false })

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const api = useKybApi()
const draft = useKybDraft()

const email = ref('')
const emailError = ref('')
const submitting = ref(false)

// Si ya hay un draft activo (recovery), mandamos directo al step 1 sin re-arrancar.
onMounted(() => {
  if (draft.hasDraft.value) {
    toastStore.addToast(t('kyb.wizard.draftRecovered'), 'success', 3000)
    navigateTo(ROUTES.ONBOARDING_STEP(1), { replace: true })
  }
})

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }

async function startWizard() {
  emailError.value = ''
  if (!email.value.trim()) {
    emailError.value = t('kyb.start.emailRequired')
    return
  }
  if (!validateEmail(email.value)) {
    emailError.value = t('kyb.start.emailInvalid')
    return
  }
  submitting.value = true
  try {
    await api.start({ ownerEmail: email.value.trim() })
    navigateTo(ROUTES.ONBOARDING_STEP(1))
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      toastStore.addToast(t('kyb.start.errorRateLimit'), 'error', 5000)
    } else {
      toastStore.addToast(t('kyb.start.errorGeneric'), 'error', 5000)
    }
  } finally {
    submitting.value = false
  }
}

const checklistItems = computed(() => [
  { icon: FileCheck, text: t('kyb.start.checklistIdentity') },
  { icon: Camera, text: t('kyb.start.checklistSelfie') },
  { icon: Building2, text: t('kyb.start.checklistEntity') },
  { icon: Clock, text: t('kyb.start.checklistTime') },
])

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
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
      <!-- Brand mark -->
      <div :class="['inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6', themeStore.isDarkMode ? 'bg-[#7C3AED]/20' : 'bg-[#DBD3FB]/60']">
        <ShieldCheck :size="26" :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'" />
      </div>

      <h1 :class="['text-3xl sm:text-4xl font-bold tracking-tight mb-3', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        {{ $t('kyb.start.headline') }}
      </h1>
      <p :class="['text-sm sm:text-base mb-8 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ $t('kyb.start.lead') }}
      </p>

      <!-- Checklist -->
      <ul class="space-y-3 mb-10">
        <li v-for="(item, i) in checklistItems" :key="i" class="flex items-start gap-3">
          <div :class="['shrink-0 w-9 h-9 rounded-full flex items-center justify-center', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]']">
            <component :is="item.icon" :size="16" />
          </div>
          <span :class="['text-sm font-medium pt-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
            {{ item.text }}
          </span>
        </li>
      </ul>

      <!-- Email + start CTA -->
      <form class="space-y-4" novalidate @submit.prevent="startWizard">
        <div>
          <label for="kyb-start-email" :class="['block text-xs font-bold uppercase tracking-wide mb-2', labelCls]">
            {{ $t('kyb.start.emailLabel') }}
          </label>
          <Input
            id="kyb-start-email"
            v-model="email"
            type="email"
            placeholder="ana@hotel.bo"
            required
            aria-required="true"
            :aria-invalid="!!emailError"
            :aria-describedby="emailError ? 'kyb-start-email-error' : 'kyb-start-email-help'"
            :disabled="submitting"
          />
          <p v-if="emailError" id="kyb-start-email-error" role="alert" class="text-rose-500 text-xs font-medium mt-1.5">
            {{ emailError }}
          </p>
          <p v-else id="kyb-start-email-help" :class="['text-xs mt-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ $t('kyb.start.emailHelp') }}
          </p>
        </div>
        <Button class="w-full justify-center" type="submit" :disabled="submitting">
          <span v-if="submitting">{{ $t('kyb.start.startingWizard') }}</span>
          <template v-else>
            {{ $t('kyb.wizard.startCta') }}
            <ArrowRight :size="16" class="ml-2" />
          </template>
        </Button>
      </form>
    </motion.main>
  </div>
</template>
