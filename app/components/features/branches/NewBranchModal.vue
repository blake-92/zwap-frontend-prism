<script setup>
import { ref, computed } from 'vue'
import { Building2, Star, Save } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import { useThemeStore } from '~/stores/theme'
import { useBranchesStore } from '~/stores/branches'
import { useToastStore } from '~/stores/toast'
import { ApiError } from '~/utils/api'

// Modal dual purpose: si no recibe `branch` crea (POST); si lo recibe, edita (PATCH).
// Reúsa el mismo layout/animation que el create — solo cambian el title, el handler y el label
// del botón. Patrón inspirado en `LinksView.vue` que también reusa `NewLinkModal` para edit.
const props = defineProps({
  branch: { type: Object, default: null },
})
const emit = defineEmits(['close', 'created', 'updated'])
const { t } = useI18n()
const themeStore = useThemeStore()
const branchesStore = useBranchesStore()
const toastStore = useToastStore()

const isEdit = computed(() => props.branch !== null)

// Pre-fill desde la branch en edit mode. Si no hay branch, valores vacíos (create flow).
const name = ref(props.branch?.name ?? '')
const code = ref(props.branch?.code ?? '')
const isPrimary = ref(props.branch?.isPrimary ?? false)
const submitting = ref(false)
const errorMsg = ref('')

const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const isDisabled = computed(() => !name.value.trim() || submitting.value)

// En edit mode, calculamos diff para mandar solo lo que cambió. El backend trata `null` como
// "no cambiar" (UpdateBranchRequest doc), entonces solo poblamos los fields modificados.
const buildPatchBody = () => {
  const body = {}
  const trimmedName = name.value.trim()
  const trimmedCode = code.value.trim()
  if (trimmedName !== props.branch.name) body.name = trimmedName
  // Code: solo si tiene valor y cambió. Vaciar el code (de "PRI" a "") no se soporta —
  // backend no expone "set null" via PATCH (gap conocido).
  if (trimmedCode && trimmedCode !== (props.branch.code ?? '')) body.code = trimmedCode
  if (isPrimary.value !== props.branch.isPrimary) body.isPrimary = isPrimary.value
  return body
}

const handleSubmit = async () => {
  if (isDisabled.value) return
  errorMsg.value = ''

  if (isEdit.value) {
    const body = buildPatchBody()
    if (Object.keys(body).length === 0) {
      // Nothing to update — UX: cerrar silenciosamente o mostrar hint. Optamos por hint
      // para que el user sepa por qué no pasa nada y no piense que el botón está roto.
      errorMsg.value = t('branches.noChanges')
      return
    }
    submitting.value = true
    try {
      const updated = await branchesStore.update(props.branch.id, body)
      toastStore.addToast(t('branches.updateSuccess'), 'success')
      emit('updated', updated)
      emit('close')
    } catch (err) {
      errorMsg.value = mapError(err)
    } finally {
      submitting.value = false
    }
    return
  }

  // Create flow.
  submitting.value = true
  try {
    const branch = await branchesStore.create({
      name: name.value.trim(),
      code: code.value.trim() || null,
      isPrimary: isPrimary.value,
    })
    toastStore.addToast(t('branches.createSuccess'), 'success')
    emit('created', branch)
    emit('close')
  } catch (err) {
    errorMsg.value = mapError(err)
  } finally {
    submitting.value = false
  }
}

function mapError(err) {
  if (err instanceof ApiError) {
    if (err.status === 409 && /name_taken/i.test(err.message || '')) return t('branches.errorNameTaken')
    if (err.status === 403) return t('errors.permissionDenied')
    if (!err.status) return t('errors.network')
  }
  return t('errors.unexpected')
}
</script>

<template>
  <Modal
    :title="isEdit ? t('branches.editBranchTitle') : t('branches.newBranch')"
    :description="isEdit ? t('branches.editBranchDesc') : t('branches.modalDescription')"
    :icon="Building2"
    max-width="480px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-8 space-y-5">
      <div>
        <label :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('branches.branchName').toUpperCase() }}</label>
        <Input v-model="name" :placeholder="t('branches.branchNamePlaceholder')" :disabled="submitting" />
      </div>
      <div>
        <label :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('branches.code').toUpperCase() }}</label>
        <Input v-model="code" :placeholder="t('branches.codePlaceholder')" :disabled="submitting" />
        <p :class="['text-xs font-medium mt-2', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ t('branches.codeHint') }}
        </p>
      </div>
      <label :class="['flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/40 border-white hover:bg-white/70']">
        <input
          type="checkbox"
          v-model="isPrimary"
          :disabled="submitting"
          class="w-4 h-4 accent-[#7C3AED] rounded shrink-0"
        />
        <Star :size="16" class="text-[#7C3AED] shrink-0" />
        <div class="min-w-0 flex-1">
          <p :class="['text-sm font-semibold leading-tight', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
            {{ t('branches.primaryToggle') }}
          </p>
          <p :class="['text-[11px] font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ t('branches.primaryHint') }}
          </p>
        </div>
      </label>
      <p
        v-if="errorMsg"
        role="alert"
        :class="['text-xs font-semibold', themeStore.isDarkMode ? 'text-rose-400' : 'text-rose-600']"
      >
        {{ errorMsg }}
      </p>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" :disabled="submitting" @click="emit('close')">
        {{ t('common.cancel') }}
      </Button>
      <Button class="flex-1 !py-3.5" :disabled="isDisabled" @click="handleSubmit">
        <component :is="isEdit ? Save : Building2" :size="18" />
        <template v-if="isEdit">
          {{ submitting ? t('branches.saving') : t('branches.saveChanges') }}
        </template>
        <template v-else>
          {{ submitting ? t('branches.creating') : t('branches.createBranch') }}
        </template>
      </Button>
    </template>
  </Modal>
</template>
