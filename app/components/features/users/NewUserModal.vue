<script setup>
import { ref, computed } from 'vue'
import { UserPlus, Shield, Calculator, ConciergeBell, Mail, Building2 } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { useUsersStore } from '~/stores/users'
import { useBranchesStore } from '~/stores/branches'
import { useToastStore } from '~/stores/toast'
import { ApiError } from '~/utils/api'
import { ROLE_ALLOWS_BRANCH_SCOPING } from '~/utils/roles'

const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()
const usersStore = useUsersStore()
const branchesStore = useBranchesStore()
const toastStore = useToastStore()

// El backend tiene 4 role codes (OWNER/ADMIN/ACCOUNTANT/RECEPTIONIST). OWNER no se invita —
// existe solo el primer user del merchant, creado en onboarding.
const role = ref('RECEPTIONIST')
const branchId = ref('')
const fullName = ref('')
const email = ref('')
const emailError = ref('')
const submitting = ref(false)
const errorMsg = ref('')

const emailPlaceholder = 'admin@hoteldesal.bo'

const ROLES = computed(() => [
  { code: 'ADMIN', icon: Shield, label: t('users.roleAdmin'), desc: t('users.roleAdminDesc') },
  { code: 'ACCOUNTANT', icon: Calculator, label: t('users.roleAccountant'), desc: t('users.roleAccountantDesc') },
  { code: 'RECEPTIONIST', icon: ConciergeBell, label: t('users.roleReceptionist'), desc: t('users.roleReceptionistDesc') },
])

const ROLE_SELECTED_STYLE = {
  ADMIN: { onDark: 'bg-[#7C3AED]/10 border-[#7C3AED]/50', onLight: 'bg-[#DBD3FB]/40 border-[#7C3AED]/40' },
  ACCOUNTANT: { onDark: 'bg-amber-500/10 border-amber-500/50', onLight: 'bg-amber-50 border-amber-400' },
  RECEPTIONIST: { onDark: 'bg-emerald-500/10 border-emerald-500/50', onLight: 'bg-emerald-50 border-emerald-400' },
}
const ROLE_ICON_STYLE = {
  ADMIN: 'text-[#7C3AED]',
  ACCOUNTANT: 'text-amber-500',
  RECEPTIONIST: 'text-emerald-500',
}

const requiresBranch = computed(() => ROLE_ALLOWS_BRANCH_SCOPING[role.value] === true)
const activeBranches = computed(() => branchesStore.active)

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const handleEmailInput = (v) => {
  email.value = v
  if (emailError.value && validateEmail(v)) emailError.value = ''
}

const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')

const roleBoxClass = (code) => {
  const active = role.value === code
  const d = themeStore.isDarkMode
  if (active) return d ? ROLE_SELECTED_STYLE[code].onDark : ROLE_SELECTED_STYLE[code].onLight
  return d ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
}
const roleIconClass = (code) => {
  if (role.value === code) return ROLE_ICON_STYLE[code]
  return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
}

const branchRowClass = (id) => {
  const active = branchId.value === id
  const d = themeStore.isDarkMode
  if (active) return d ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30' : 'bg-[#DBD3FB]/30 border-[#7C3AED]/30'
  return d ? 'bg-[#111113]/20 border-white/5 hover:bg-white/5' : 'bg-white/40 border-white hover:bg-white/70'
}

const isDisabled = computed(() => {
  if (submitting.value) return true
  if (!fullName.value.trim()) return true
  if (!email.value.trim() || !validateEmail(email.value)) return true
  if (requiresBranch.value && !branchId.value) return true
  return false
})

const handleSubmit = async () => {
  errorMsg.value = ''
  if (!validateEmail(email.value)) {
    emailError.value = t('users.invalidEmail')
    return
  }
  if (requiresBranch.value && !branchId.value) {
    errorMsg.value = t('users.errorReceptionistNeedsBranch')
    return
  }
  submitting.value = true
  try {
    const result = await usersStore.invite({
      email: email.value.trim(),
      fullName: fullName.value.trim(),
      roleAssignments: [
        { roleCode: role.value, branchId: requiresBranch.value ? branchId.value : null },
      ],
    })
    if (result?.inviteEmailSent) {
      toastStore.addToast(t('users.inviteSuccess', { email: email.value.trim() }), 'success', 4000)
    } else {
      toastStore.addToast(t('users.inviteSuccessNoEmail'), 'error', 5000)
    }
    emit('close')
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const map = {
        email_already_in_use: 'users.errorEmailTaken',
        merchant_must_have_owner: 'users.errorMustHaveOwner',
      }
      const key = map[err.message] ?? 'errors.unexpected'
      errorMsg.value = t(key)
    } else if (err instanceof ApiError && err.status === 403) {
      errorMsg.value = t('errors.permissionDenied')
    } else if (err instanceof ApiError && !err.status) {
      errorMsg.value = t('errors.network')
    } else {
      errorMsg.value = t('errors.unexpected')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Modal
    :title="t('users.newUser')"
    :description="t('users.newUserDesc')"
    :icon="UserPlus"
    max-width="540px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-8 space-y-7">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="user-name" :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('users.name') }}</label>
          <Input id="user-name" v-model="fullName" :placeholder="t('users.fullNamePlaceholder')" :disabled="submitting" />
        </div>
        <div class="relative">
          <label for="user-email" :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('users.emailLabel') }}</label>
          <Input
            id="user-email"
            :model-value="email"
            :icon="Mail"
            type="email"
            :placeholder="emailPlaceholder"
            :error="!!emailError"
            :disabled="submitting"
            @update:model-value="handleEmailInput"
          />
          <span v-if="emailError" class="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500">
            {{ emailError }}
          </span>
        </div>
      </div>

      <!-- Role -->
      <div>
        <SectionLabel class="mb-4">{{ t('users.role') }}</SectionLabel>
        <div role="radiogroup" :aria-label="t('users.role')" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            v-for="r in ROLES"
            :key="r.code"
            role="radio"
            :aria-checked="role === r.code"
            tabindex="0"
            :class="['p-4 rounded-xl border cursor-pointer transition-colors', roleBoxClass(r.code)]"
            @click="role = r.code"
            @keydown.enter.prevent="role = r.code"
            @keydown.space.prevent="role = r.code"
          >
            <component :is="r.icon" :size="20" :class="['mb-2', roleIconClass(r.code)]" />
            <p :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ r.label }}</p>
            <p :class="['text-[10px] mt-1 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ r.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Branch scope: solo aplicable a RECEPTIONIST. ADMIN/ACCOUNTANT son globales y se
           invitan sin branchId (backend rechaza scoping inválido por rol). -->
      <div>
        <SectionLabel class="mb-2">{{ t('users.branchScope') }}</SectionLabel>
        <p :class="['text-[11px] font-medium mb-4', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ t('users.branchScopeHint') }}
        </p>

        <div v-if="requiresBranch" class="flex flex-col gap-2">
          <label
            v-for="b in activeBranches"
            :key="b.id"
            :class="['flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors', branchRowClass(b.id)]"
          >
            <span :class="['text-sm font-semibold flex items-center gap-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
              <Building2 :size="14" class="opacity-60" />
              {{ b.name }}
              <span v-if="b.isPrimary" :class="['ml-1 text-[10px] font-bold uppercase', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']">
                {{ t('branches.main') }}
              </span>
            </span>
            <input
              type="radio"
              name="branchId"
              :value="b.id"
              v-model="branchId"
              :disabled="submitting"
              class="w-4 h-4 accent-[#7C3AED]"
            />
          </label>
        </div>
        <div
          v-else
          :class="['p-3 rounded-xl border text-sm font-medium', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/10 text-[#888991]' : 'bg-white/40 border-white text-[#67656E]']"
        >
          {{ t('users.noBranchScope') }}
        </div>
      </div>

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
        <UserPlus :size="18" />
        {{ submitting ? t('common.creating') : t('users.createUser') }}
      </Button>
    </template>
  </Modal>
</template>
