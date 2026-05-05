<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Banner global del estado del KYB. Renderea distinto copy + color según kybState. El componente
// es presentation-only — el state lo provee el caller (layout default lo lee de useSessionStore;
// la página /onboarding/review lo lee del polling de useKybApi).
const props = defineProps({
  // Uno de: SUBMITTED, IN_REVIEW, MORE_INFO_REQUIRED, REJECTED.
  // Otros valores (DRAFT, APPROVED, GRANDFATHERED) hacen que el banner NO renderee.
  kybState: { type: String, required: true },
  // Mostrar dismiss button. Default false (en /onboarding/review NO se debe poder dismissear).
  dismissible: { type: Boolean, default: false },
  // Para REJECTED, mostrar la razón.
  rejectionReason: { type: String, default: '' },
  // Slot 'cta' para botones contextuales (ej. "Completar info pendiente").
})
const emit = defineEmits(['dismiss'])

const themeStore = useThemeStore()

const config = computed(() => {
  switch (props.kybState) {
    case 'SUBMITTED':
      return {
        icon: Clock,
        title: 'kyb.banner.submittedTitle',
        body: 'kyb.banner.submittedBody',
        accent: 'amber',
      }
    case 'IN_REVIEW':
      return {
        icon: Clock,
        title: 'kyb.banner.inReviewTitle',
        body: 'kyb.banner.inReviewBody',
        accent: 'amber',
      }
    case 'MORE_INFO_REQUIRED':
      return {
        icon: AlertCircle,
        title: 'kyb.banner.moreInfoTitle',
        body: 'kyb.banner.moreInfoBody',
        accent: 'amber',
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        title: 'kyb.banner.rejectedTitle',
        body: 'kyb.banner.rejectedBody',
        accent: 'rose',
      }
    case 'APPROVED':
      return {
        icon: CheckCircle2,
        title: 'kyb.banner.submittedTitle', // never shown — APPROVED filtered upstream
        body: 'kyb.banner.submittedBody',
        accent: 'emerald',
      }
    default:
      return null
  }
})

const visible = computed(() => config.value !== null)

const wrapperClass = computed(() => {
  if (!config.value) return ''
  const accent = config.value.accent
  const dark = themeStore.isDarkMode
  if (accent === 'amber') {
    return dark
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
      : 'bg-amber-50 border-amber-200 text-amber-900'
  }
  if (accent === 'rose') {
    return dark
      ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
      : 'bg-rose-50 border-rose-200 text-rose-900'
  }
  return dark
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
})

const iconClass = computed(() => {
  if (!config.value) return ''
  const a = config.value.accent
  if (a === 'amber') return 'text-amber-500'
  if (a === 'rose') return 'text-rose-500'
  return 'text-emerald-500'
})
</script>

<template>
  <motion.div
    v-if="visible"
    role="status"
    aria-live="polite"
    :class="['rounded-xl border px-5 py-4 flex items-start gap-3', wrapperClass]"
    :initial="{ opacity: 0, y: -8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="SPRING_SOFT"
  >
    <component :is="config.icon" :size="20" :class="['shrink-0 mt-0.5', iconClass]" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold mb-0.5">
        {{ $t(config.title) }}
      </p>
      <p class="text-xs font-medium leading-relaxed opacity-90">
        <template v-if="kybState === 'REJECTED' && rejectionReason">
          {{ $t('kyb.review.leadRejected', { reason: rejectionReason }) }}
        </template>
        <template v-else>
          {{ $t(config.body) }}
        </template>
      </p>
      <slot name="cta" />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity shrink-0"
      :aria-label="$t('common.close')"
      @click="emit('dismiss')"
    >
      ×
    </button>
  </motion.div>
</template>
