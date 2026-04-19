<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { UserPlus, Shield, Calculator, ConciergeBell, Mail } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { BRANCH_LIST } from '~/utils/mockData'

const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()

const role = ref('receptionist')
const branches = ref([])
const name = ref('')
const email = ref('')
const emailError = ref('')
const isSubmitting = ref(false)

// Hardcoded email placeholder (moved out of i18n due to vue-i18n @ parsing conflict)
const emailPlaceholder = 'admin@hotel.com'

const ROLES = computed(() => [
  { id: 'admin', icon: Shield, label: t('users.roleAdmin'), desc: t('users.roleAdminDesc') },
  { id: 'accountant', icon: Calculator, label: t('users.roleAccountant'), desc: t('users.roleAccountantDesc') },
  { id: 'receptionist', icon: ConciergeBell, label: t('users.roleReceptionist'), desc: t('users.roleReceptionistDesc') },
])

const ROLE_SELECTED_STYLE = {
  admin: { onDark: 'bg-[#7C3AED]/10 border-[#7C3AED]/50', onLight: 'bg-[#DBD3FB]/40 border-[#7C3AED]/40' },
  accountant: { onDark: 'bg-amber-500/10 border-amber-500/50', onLight: 'bg-amber-50 border-amber-400' },
  receptionist: { onDark: 'bg-emerald-500/10 border-emerald-500/50', onLight: 'bg-emerald-50 border-emerald-400' },
}
const ROLE_ICON_STYLE = {
  admin: 'text-[#7C3AED]',
  accountant: 'text-amber-500',
  receptionist: 'text-emerald-500',
}

const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const handleEmailInput = (v) => {
  email.value = v
  if (emailError.value && validateEmail(v)) emailError.value = ''
}

let submitTimer = null
const handleSubmit = () => {
  if (!name.value.trim()) return
  if (!email.value.trim() || !validateEmail(email.value)) {
    emailError.value = t('users.invalidEmail')
    return
  }
  if (branches.value.length === 0) return
  isSubmitting.value = true
  submitTimer = setTimeout(() => {
    submitTimer = null
    isSubmitting.value = false
    emit('close')
  }, 1500)
}
onUnmounted(() => {
  if (submitTimer) clearTimeout(submitTimer)
})

const toggleBranch = (id) => {
  const i = branches.value.indexOf(id)
  if (i >= 0) branches.value.splice(i, 1)
  else branches.value.push(id)
}

const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')

const roleBoxClass = (id) => {
  const active = role.value === id
  const d = themeStore.isDarkMode
  if (active) return d ? ROLE_SELECTED_STYLE[id].onDark : ROLE_SELECTED_STYLE[id].onLight
  return d ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
}
const roleIconClass = (id) => {
  if (role.value === id) return ROLE_ICON_STYLE[id]
  return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
}

const branchRowClass = (id) => {
  const active = branches.value.includes(id)
  const d = themeStore.isDarkMode
  if (active) return d ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30' : 'bg-[#DBD3FB]/30 border-[#7C3AED]/30'
  return d ? 'bg-[#111113]/20 border-white/5 hover:bg-white/5' : 'bg-white/40 border-white hover:bg-white/70'
}

const disabled = computed(() => !name.value.trim() || !email.value.trim() || branches.value.length === 0 || isSubmitting.value)
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
          <Input id="user-name" v-model="name" :placeholder="t('users.fullNamePlaceholder')" />
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
        <div role="radiogroup" :aria-label="t('users.role')" class="grid grid-cols-3 gap-3">
          <div
            v-for="r in ROLES"
            :key="r.id"
            role="radio"
            :aria-checked="role === r.id"
            tabindex="0"
            :class="['p-4 rounded-xl border cursor-pointer transition-colors', roleBoxClass(r.id)]"
            @click="role = r.id"
            @keydown.enter.prevent="role = r.id"
            @keydown.space.prevent="role = r.id"
          >
            <component :is="r.icon" :size="20" :class="['mb-2', roleIconClass(r.id)]" />
            <p :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ r.label }}</p>
            <p :class="['text-[10px] mt-1 leading-relaxed', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ r.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Branches -->
      <div>
        <SectionLabel class="mb-4">{{ t('users.branchAccess') }}</SectionLabel>
        <div class="flex flex-col gap-2">
          <label
            v-for="b in BRANCH_LIST"
            :key="b.id"
            :class="['flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors', branchRowClass(b.id)]"
          >
            <span :class="['text-sm font-semibold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
              {{ b.name }}
              <span v-if="b.isMain" :class="['ml-2 text-[10px] font-bold uppercase', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']">
                {{ t('branches.main') }}
              </span>
            </span>
            <input
              type="checkbox"
              :checked="branches.includes(b.id)"
              class="w-4 h-4 accent-[#7C3AED] rounded"
              @change="toggleBranch(b.id)"
            />
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" :disabled="isSubmitting" @click="emit('close')">
        {{ t('common.cancel') }}
      </Button>
      <Button class="flex-1 !py-3.5 relative overflow-hidden" :disabled="disabled" @click="handleSubmit">
        <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
          {{ t('common.creating') }}...
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <UserPlus :size="18" /> {{ t('users.createUser') }}
        </span>
      </Button>
    </template>
  </Modal>
</template>
