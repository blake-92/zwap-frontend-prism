<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { AlertCircle } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

// Renderea el JSONB businessProfile.moreInfoRequested cuando el back-office pide más info.
// Forma:
//   { fields: ['expectedMonthlyVolumeCents'], documents: ['BANK_STATEMENT'], note: '…',
//     requestedBy: uuid, requestedAt: ISO }
//
// Ítems renderizados como <ul><li> (no comma-list) para SR. role=alert porque es evento async.
const props = defineProps({
  data: { type: Object, required: true },
})
const themeStore = useThemeStore()
const { t, locale } = useI18n()

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return iso }
}

const fields = computed(() => Array.isArray(props.data?.fields) ? props.data.fields : [])
const documents = computed(() => Array.isArray(props.data?.documents) ? props.data.documents : [])
const note = computed(() => props.data?.note ?? '')
const requestedAt = computed(() => formatDate(props.data?.requestedAt))

// Resolver labels: docs van por kyb.documents.X (espejo del catálogo); fields van por su key
// camelCase tal cual (el backend manda "expectedMonthlyVolumeCents", etc.) — agregamos un
// helper de prettify simple en lugar de mantener un mapa exhaustivo.
const prettifyField = (key) => {
  if (!key) return ''
  // SCREAMING_SNAKE_CASE → "Screaming Snake Case" (todas mayúsculas + underscores)
  if (/^[A-Z][A-Z0-9_]*$/.test(key)) {
    return key.toLowerCase().split('_').filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
  }
  // camelCase → "Camel Case"
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()
}

const wrapperClass = computed(() => themeStore.isDarkMode
  ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
  : 'bg-amber-50 border-amber-200 text-amber-900')
</script>

<template>
  <motion.aside
    role="alert"
    aria-live="assertive"
    :class="['rounded-xl border px-5 py-4 flex items-start gap-3', wrapperClass]"
    :initial="{ opacity: 0, y: -8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="SPRING_SOFT"
  >
    <AlertCircle :size="20" class="shrink-0 mt-0.5 text-amber-500" />
    <div class="flex-1 min-w-0 space-y-3">
      <header>
        <p class="text-sm font-bold">{{ $t('kyb.moreInfoAlert.title') }}</p>
        <p v-if="requestedAt" class="text-xs opacity-80">{{ $t('kyb.moreInfoAlert.requestedAt', { date: requestedAt }) }}</p>
      </header>

      <div v-if="fields.length > 0">
        <p class="text-xs font-bold uppercase tracking-wide mb-1">{{ $t('kyb.moreInfoAlert.fieldsLabel') }}</p>
        <ul class="list-disc list-inside text-xs font-medium space-y-0.5">
          <li v-for="f in fields" :key="`f-${f}`">{{ prettifyField(f) }}</li>
        </ul>
      </div>
      <p v-else class="text-xs italic opacity-70">{{ $t('kyb.moreInfoAlert.noFieldsHelp') }}</p>

      <div v-if="documents.length > 0">
        <p class="text-xs font-bold uppercase tracking-wide mb-1">{{ $t('kyb.moreInfoAlert.documentsLabel') }}</p>
        <ul class="list-disc list-inside text-xs font-medium space-y-0.5">
          <li v-for="d in documents" :key="`d-${d}`">
            {{ $te(`kyb.documents.${d}`) ? $t(`kyb.documents.${d}`) : prettifyField(d) }}
          </li>
        </ul>
      </div>
      <p v-else class="text-xs italic opacity-70">{{ $t('kyb.moreInfoAlert.noDocumentsHelp') }}</p>

      <div v-if="note">
        <p class="text-xs font-bold uppercase tracking-wide mb-1">{{ $t('kyb.moreInfoAlert.noteLabel') }}</p>
        <p class="text-sm font-medium">{{ note }}</p>
      </div>
    </div>
  </motion.aside>
</template>
