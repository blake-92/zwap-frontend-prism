<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import { CheckCircle2, FileText } from 'lucide-vue-next'
import KybDocumentUploader from '~/components/features/kyb/shared/KybDocumentUploader.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { useEntityDocRequirements, IDENTITY_DOCUMENT_OPTIONS } from '~/composables/kyb/useEntityDocRequirements'
import { SPRING_SOFT } from '~/utils/springs'

// Step de uploads. Toma el entityType del wizard state global y renderea los uploaders
// requeridos según useEntityDocRequirements. El "IDENTITY" placeholder se resuelve en runtime
// con un selector que el user usa para elegir CI / PASSPORT / DNI.
//
// Tracking de uploads: mantenemos un map { docKey → { documentId, type } } indexado por
// posición + tipo. El submit del wizard valida que todos los slots requeridos estén llenos
// antes de habilitar el botón "Enviar para revisión".
const props = defineProps({
  entityType: { type: String, required: true },
  // Tracking previo si el step recargó (recovery futuro). Por ahora vacío.
  initial: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['change', 'allUploaded'])

const { t } = useI18n()
const themeStore = useThemeStore()

const requirements = computed(() => useEntityDocRequirements(props.entityType))

// El user elige el tipo de identidad (CI/PASSPORT/DNI) — se aplica a TODOS los uploaders
// "IDENTITY" del set personDocs. Default: CI_BO para BO, PASSPORT genérico.
const identityType = ref(props.initial.identityType ?? 'CI_BO')

// uploadsByKey: { [docTypeKey]: { documentId, documentType } }
// docTypeKey = el tipo final (ej. CI_BO, SELFIE, TAX_REGISTRATION)
const uploadsByKey = ref({ ...(props.initial.uploadsByKey ?? {}) })

// Lista de tipos final que necesitamos (sustituye 'IDENTITY' por identityType.value).
const personDocsResolved = computed(() => requirements.value.personDocs.map((d) => d === 'IDENTITY' ? identityType.value : d))
const entityDocsResolved = computed(() => [...requirements.value.entityDocs])
const allRequiredTypes = computed(() => [...personDocsResolved.value, ...entityDocsResolved.value])

const uploadedCount = computed(() => allRequiredTypes.value.filter((t) => uploadsByKey.value[t]).length)
const totalCount = computed(() => allRequiredTypes.value.length)
const allDone = computed(() => totalCount.value > 0 && uploadedCount.value === totalCount.value)

watch(allDone, (v) => { if (v) emit('allUploaded', uploadsByKey.value) })
watch(uploadsByKey, () => emit('change', { identityType: identityType.value, uploadsByKey: uploadsByKey.value }), { deep: true })

function onUploaded(docType, response) {
  uploadsByKey.value = { ...uploadsByKey.value, [docType]: { documentId: response.documentId, documentType: response.documentType } }
}

function onRemoved(docType) {
  const next = { ...uploadsByKey.value }
  delete next[docType]
  uploadsByKey.value = next
}

defineExpose({ allDone, uploadsByKey })

const labelCls = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const fieldClass = `block text-xs font-bold uppercase tracking-wide mb-2 `
const selectCls = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] border-white focus:border-[#7C3AED]/60')

const progressPillCls = computed(() => allDone.value
  ? 'bg-emerald-500/15 text-emerald-500'
  : (themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'))
</script>

<template>
  <motion.section
    class="space-y-8"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="SPRING_SOFT"
  >
    <!-- Progress pill -->
    <div :class="['flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold', progressPillCls]" aria-live="polite">
      <CheckCircle2 v-if="allDone" :size="16" />
      <FileText v-else :size="16" />
      <span v-if="allDone">{{ $t('kyb.step6.progressComplete') }}</span>
      <span v-else>{{ $t('kyb.step6.progressLabel', { uploaded: uploadedCount, total: totalCount }) }}</span>
    </div>

    <!-- Person docs -->
    <section v-if="personDocsResolved.length > 0">
      <SectionLabel>{{ $t('kyb.step6.personDocsSection') }}</SectionLabel>

      <!-- Selector de identityType (solo si IDENTITY está en la lista) -->
      <div v-if="requirements.personDocs.includes('IDENTITY')" class="mt-3 max-w-sm">
        <label for="step6-identityType" :class="[fieldClass, labelCls]">{{ $t('kyb.step6.identitySelectLabel') }}</label>
        <select id="step6-identityType" v-model="identityType"
          :class="['w-full rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30', selectCls]"
        >
          <option v-for="opt in IDENTITY_DOCUMENT_OPTIONS" :key="opt" :value="opt">
            {{ $t(`kyb.documents.${opt}`) }}
          </option>
        </select>
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <KybDocumentUploader
          v-for="docType in personDocsResolved"
          :key="`person-${docType}`"
          scope="person"
          endpoint="wizard"
          :document-type="docType"
          :label="$t(`kyb.documents.${docType}`)"
          @uploaded="(r) => onUploaded(docType, r)"
          @removed="() => onRemoved(docType)"
        />
      </div>
    </section>

    <!-- Entity docs -->
    <section v-if="entityDocsResolved.length > 0">
      <SectionLabel>{{ $t('kyb.step6.entityDocsSection') }}</SectionLabel>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <KybDocumentUploader
          v-for="docType in entityDocsResolved"
          :key="`entity-${docType}`"
          scope="entity"
          endpoint="wizard"
          :document-type="docType"
          :label="$t(`kyb.documents.${docType}`)"
          @uploaded="(r) => onUploaded(docType, r)"
          @removed="() => onRemoved(docType)"
        />
      </div>
    </section>

    <!-- Empty state — debería ser muy raro (NATURAL_PERSON tiene 2 docs person, 0 entity) -->
    <p v-if="totalCount === 0" :class="['text-sm', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
      No hay documentos requeridos para este tipo de entidad.
    </p>
  </motion.section>
</template>
