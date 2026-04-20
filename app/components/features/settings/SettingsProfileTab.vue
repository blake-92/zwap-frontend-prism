<script setup>
import { ref, computed } from 'vue'
import { Mail, Bell, Save, Smartphone, Globe, Zap } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useToastStore } from '~/stores/toast'
import { CURRENT_USER } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Toggle from '~/components/ui/Toggle.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import SettingItem from './SettingItem.vue'

defineProps({
  showSection: { type: Function, required: true },
})

const { t, locale, setLocale } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const toastStore = useToastStore()

const alertEmails = ref(true)
const pushNotifs = ref(false)

const handleSave = () => toastStore.addToast(t('settings.changesSaved'), 'success')

const sectionLabelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const borderSecondary = computed(() => themeStore.isDarkMode ? 'border-white/5' : 'border-black/5')
const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')

const perfTier = computed({
  get: () => perfStore.tier,
  set: (v) => {
    if (v === 'auto') {
      try { localStorage.removeItem('zwap-perf') } catch { /* Safari private mode / storage denied */ }
      perfStore.hydrate()
    } else {
      perfStore.setTier(v)
    }
  },
})
const perfOptions = computed(() => [
  { value: 'full', label: t('settings.perfFull') },
  { value: 'normal', label: t('settings.perfNormal') },
  { value: 'lite', label: t('settings.perfLite') },
])
const perfDesc = computed(() => {
  if (perfStore.tier === 'full') return t('settings.perfFullDesc')
  if (perfStore.tier === 'normal') return t('settings.perfNormalDesc')
  if (perfStore.tier === 'lite') return t('settings.perfLiteDesc')
  return ''
})

const langBtnClass = (code) => {
  const active = locale.value === code
  const d = themeStore.isDarkMode
  if (active) return d ? 'bg-[#7C3AED]/20 text-[#A78BFA]' : 'bg-[#DBD3FB]/50 text-[#7C3AED]'
  return d ? 'text-[#888991] hover:bg-white/5' : 'text-[#67656E] hover:bg-black/5'
}

const avatarClass = computed(() =>
  themeStore.isDarkMode
    ? `bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40${perfStore.useNeon ? ' group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : ''}`
    : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-xs',
)
</script>

<template>
  <!-- PERSONAL INFO -->
  <Card v-if="showSection('personal-info')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.personalInfo') }}</h3>
    <div class="flex flex-col sm:flex-row gap-8 items-start mb-8">
      <div class="relative group cursor-pointer">
        <div :class="['w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-2xl transition-colors', avatarClass]">{{ CURRENT_USER.initials }}</div>
        <div class="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold backdrop-blur-xs">
          {{ t('common.change') }}
        </div>
      </div>
      <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label for="settings-name" :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('users.fullName') }}</label>
          <Input id="settings-name" :model-value="CURRENT_USER.name" />
        </div>
        <div>
          <label for="settings-role" :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('users.role') }}</label>
          <Input id="settings-role" :model-value="t('users.roleAdmin')" disabled />
        </div>
        <div class="md:col-span-2">
          <label for="settings-email" :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('users.emailLabel') }}</label>
          <Input id="settings-email" :icon="Mail" :model-value="CURRENT_USER.email" />
        </div>
      </div>
    </div>
    <div :class="['pt-6 border-t flex justify-end', borderSecondary]">
      <Button @click="handleSave"><Save :size="16" /> {{ t('common.save') }}</Button>
    </div>
  </Card>

  <!-- NOTIFICATIONS -->
  <Card v-if="showSection('notifications')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.notificationPrefs') }}</h3>
    <div class="flex flex-col">
      <SettingItem :icon="Bell" :title="t('settings.paymentAlerts')" :description="t('settings.paymentAlertsDesc')">
        <Toggle :aria-label="t('settings.paymentAlerts')" :active="alertEmails" @toggle="alertEmails = !alertEmails" />
      </SettingItem>
      <SettingItem :icon="Smartphone" :title="t('settings.pushNotifications')" :description="t('settings.pushNotificationsDesc')" last>
        <Toggle :aria-label="t('settings.pushNotifications')" :active="pushNotifs" @toggle="pushNotifs = !pushNotifs" />
      </SettingItem>
    </div>
  </Card>

  <!-- LANGUAGE -->
  <Card v-if="showSection('language')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.language') }}</h3>
    <SettingItem :icon="Globe" :title="t('settings.language')" :description="t('settings.languageDesc')" last>
      <div :class="['flex rounded-xl overflow-hidden border', themeStore.isDarkMode ? 'border-white/10' : 'border-black/10']">
        <button :class="['px-4 py-2 text-sm font-bold transition-colors', langBtnClass('es')]" @click="setLocale('es')">{{ t('settings.languageEs') }}</button>
        <button :class="['px-4 py-2 text-sm font-bold transition-colors border-l', langBtnClass('en'), themeStore.isDarkMode ? 'border-white/10' : 'border-black/10']" @click="setLocale('en')">{{ t('settings.languageEn') }}</button>
      </div>
    </SettingItem>
  </Card>

  <!-- PERFORMANCE -->
  <Card v-if="showSection('performance')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.performance') }}</h3>
    <div class="py-5 flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
        <SettingItem :icon="Zap" :title="t('settings.liteMode')" :description="perfDesc" last />
        <div class="shrink-0 w-full sm:w-auto">
          <SegmentControl v-model="perfTier" :options="perfOptions" layout-id="perfTierIndicator" />
        </div>
      </div>
    </div>
  </Card>
</template>
