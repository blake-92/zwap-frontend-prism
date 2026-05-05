<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { useProfileFullApi } from '~/composables/kyb/useProfileFullApi'
import { ApiError } from '~/utils/api'
import { SPRING } from '~/utils/springs'

const props = defineProps({
  // Tipo de documento — del enum PersonDocumentType o EntityDocumentType.
  documentType: { type: String, required: true },
  // 'person' (KYC owner) o 'entity' (KYB legal entity).
  scope: { type: String, required: true, validator: (v) => v === 'person' || v === 'entity' },
  // Endpoint a usar:
  //   'wizard'      → POST /api/kyb/{id}/documents/{scope} (capability token)
  //   'profile'     → POST /api/account/profile/documents/{scope}{/{entityId}} (JWT)
  endpoint: { type: String, default: 'wizard', validator: (v) => v === 'wizard' || v === 'profile' },
  // Para endpoint='profile' + scope='entity' necesitamos el id del LegalEntity.
  entityId: { type: String, default: null },
  // Metadata opcional que va junto con el file (documentCountry, documentNumber, documentExpiry).
  // El uploader la incluye en el FormData si llega.
  documentCountry: { type: String, default: null },
  documentNumber: { type: String, default: null },
  documentExpiry: { type: String, default: null },
  // Label legible — usado por aria-label y header del card.
  label: { type: String, required: true },
  // Si true, render más compacto (variante para grids densas de documentos).
  compact: { type: Boolean, default: false },
})

const emit = defineEmits([
  // emitido al backend OK con DocumentUploadResponse
  'uploaded',
  // emitido al user clickear "remove" — el padre decide si mantiene el file o no
  'removed',
])

const themeStore = useThemeStore()
const wizardApi = useKybApi()
const profileApi = useProfileFullApi()

// Estados del componente: idle, uploading, success, error.
const status = ref('idle')
const fileMeta = ref(null) // { name, size, type } — guardado para mostrar después del upload
const errorDetail = ref('')
const fileInputRef = ref(null)
const dragOver = ref(false)

// MIME aceptados — espejo del backend: image/jpeg, image/png, image/webp, application/pdf.
const ACCEPT_MIME = 'image/jpeg,image/png,image/webp,application/pdf'
const ACCEPT_MIME_SET = new Set(ACCEPT_MIME.split(','))
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function validateFile(file) {
  if (!file) return { ok: false, code: 'mimeInvalid' }
  if (!ACCEPT_MIME_SET.has(file.type)) return { ok: false, code: 'mimeInvalid' }
  if (file.size === 0) return { ok: false, code: 'empty' }
  if (file.size > MAX_BYTES) return { ok: false, code: 'tooLarge' }
  return { ok: true }
}

async function uploadFile(file) {
  const v = validateFile(file)
  if (!v.ok) {
    status.value = 'error'
    errorDetail.value = v.code
    return
  }

  status.value = 'uploading'
  errorDetail.value = ''
  fileMeta.value = { name: file.name, size: file.size, type: file.type }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('documentType', props.documentType)
  if (props.documentCountry) fd.append('documentCountry', props.documentCountry)
  if (props.documentNumber) fd.append('documentNumber', props.documentNumber)
  if (props.documentExpiry) fd.append('documentExpiry', props.documentExpiry)

  try {
    let result
    if (props.endpoint === 'wizard') {
      result = props.scope === 'person'
        ? await wizardApi.uploadPersonDocument(fd)
        : await wizardApi.uploadEntityDocument(fd)
    } else {
      result = props.scope === 'person'
        ? await profileApi.uploadPersonDocument(fd)
        : await profileApi.uploadEntityDocument(props.entityId, fd)
    }
    status.value = 'success'
    emit('uploaded', result)
  } catch (err) {
    status.value = 'error'
    if (err instanceof ApiError) {
      // Backend rechazó. Usar el code KYB si llegó, sino "generic".
      const code = err.code
      if (code === 'kyb_file_too_large') errorDetail.value = 'tooLarge'
      else if (code === 'kyb_missing_part') errorDetail.value = 'missingPart'
      else if (code === 'kyb_invalid_data' && /vacío/i.test(err.message)) errorDetail.value = 'empty'
      else if (code === 'kyb_invalid_data' && /tipo de archivo/i.test(err.message)) errorDetail.value = 'mimeInvalid'
      else errorDetail.value = 'generic'
    } else {
      errorDetail.value = 'generic'
    }
  }
}

function onFilePick(e) {
  const file = e.target.files?.[0]
  if (file) uploadFile(file)
  // Reset input para que pickear el MISMO file 2 veces seguidas dispare el change event.
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onDrop(e) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}

function onDragOver(e) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function reset() {
  status.value = 'idle'
  fileMeta.value = null
  errorDetail.value = ''
  emit('removed')
}

function retry() {
  // Re-abre el file picker — el user elige otro file (o el mismo).
  status.value = 'idle'
  errorDetail.value = ''
  fileInputRef.value?.click?.()
}

// Live region — anuncia transiciones a screen readers.
const liveMessage = computed(() => {
  if (status.value === 'uploading' && fileMeta.value) return /* i18n */ ''
  if (status.value === 'success' && fileMeta.value) return /* i18n */ ''
  if (status.value === 'error') return /* i18n */ ''
  return ''
})

// Tamaño humano para preview.
function formatBytes(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

const containerClass = computed(() => {
  const base = 'rounded-xl border-2 border-dashed transition-all duration-200 relative'
  const padding = props.compact ? 'p-4' : 'p-6'
  if (status.value === 'success') {
    return `${base} ${padding} ${themeStore.isDarkMode ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-emerald-300 bg-emerald-50/50'}`
  }
  if (status.value === 'error') {
    return `${base} ${padding} ${themeStore.isDarkMode ? 'border-rose-500/50 bg-rose-500/5' : 'border-rose-300 bg-rose-50/50'}`
  }
  if (dragOver.value) {
    return `${base} ${padding} ${themeStore.isDarkMode ? 'border-[#7C3AED]/60 bg-[#7C3AED]/10' : 'border-[#7C3AED]/50 bg-[#DBD3FB]/40'}`
  }
  return `${base} ${padding} ${themeStore.isDarkMode ? 'border-white/10 hover:border-[#7C3AED]/40 bg-white/5' : 'border-gray-200 hover:border-[#7C3AED]/40 bg-white/30'}`
})

const labelId = `kyb-upload-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <div
    :class="containerClass"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <!-- Hidden input — el wrapper actúa como dropzone + click trigger -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="ACCEPT_MIME"
      class="sr-only"
      :aria-labelledby="labelId"
      :id="labelId"
      @change="onFilePick"
    >
    <!-- Live region para SR (no visible) -->
    <div role="status" aria-live="polite" class="sr-only">
      <template v-if="status === 'uploading' && fileMeta">{{ $t('kyb.uploader.ariaUploading', { name: fileMeta.name }) }}</template>
      <template v-else-if="status === 'success' && fileMeta">{{ $t('kyb.uploader.ariaUploaded', { name: fileMeta.name }) }}</template>
    </div>
    <div v-if="status === 'error'" role="alert" class="sr-only">
      {{ $t('kyb.uploader.ariaError', { name: fileMeta?.name ?? '', detail: $t(`kyb.uploader.errors.${errorDetail}`) }) }}
    </div>

    <!-- Idle: invitación a subir -->
    <button
      v-if="status === 'idle'"
      type="button"
      class="w-full flex flex-col items-center justify-center gap-3 group"
      :aria-label="$t('kyb.uploader.trigger') + ': ' + label"
      @click="fileInputRef?.click()"
    >
      <Upload :size="compact ? 20 : 28" :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'" />
      <div class="text-center">
        <p :class="['font-bold', compact ? 'text-sm' : 'text-base', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ label }}
        </p>
        <p :class="['mt-1 text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ $t('kyb.step6.uploadHint') }}
        </p>
      </div>
    </button>

    <!-- Uploading: spinner + filename -->
    <div v-else-if="status === 'uploading'" class="flex items-center gap-3">
      <Loader2 :size="20" :class="['animate-spin shrink-0', themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]']" />
      <div class="flex-1 min-w-0">
        <p :class="['text-sm font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ fileMeta?.name }}
        </p>
        <p :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ $t('kyb.uploader.uploading') }}
        </p>
      </div>
    </div>

    <!-- Success: filename + check + remove -->
    <div v-else-if="status === 'success'" class="flex items-center gap-3">
      <CheckCircle2 :size="20" class="text-emerald-500 shrink-0" />
      <div class="flex-1 min-w-0">
        <p :class="['text-sm font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ fileMeta?.name }}
        </p>
        <p class="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
          {{ $t('kyb.uploader.uploaded') }}
          <span v-if="fileMeta?.size" :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'">
            · {{ formatBytes(fileMeta.size) }}
          </span>
        </p>
      </div>
      <button
        type="button"
        :aria-label="$t('kyb.uploader.remove')"
        class="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        @click="reset"
      >
        <X :size="16" :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'" />
      </button>
    </div>

    <!-- Error: alert + retry -->
    <div v-else-if="status === 'error'" class="flex items-center gap-3">
      <AlertCircle :size="20" class="text-rose-500 shrink-0" />
      <div class="flex-1 min-w-0">
        <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ fileMeta?.name ?? label }}
        </p>
        <p class="text-xs font-medium text-rose-500">
          {{ $t(`kyb.uploader.errors.${errorDetail}`) }}
        </p>
      </div>
      <button
        type="button"
        :aria-label="$t('kyb.uploader.retry')"
        class="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 transition-colors shrink-0"
        :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'"
        @click="retry"
      >
        <RefreshCw :size="12" />
        {{ $t('kyb.uploader.retry') }}
      </button>
    </div>
  </div>
</template>
