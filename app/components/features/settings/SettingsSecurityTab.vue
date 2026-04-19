<script setup>
import { ref, computed } from 'vue'
import { KeyRound, Lock, MonitorSmartphone, Smartphone } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { SESSIONS } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Badge from '~/components/ui/Badge.vue'
import SettingItem from './SettingItem.vue'

defineProps({
  showSection: { type: Function, required: true },
})

const { t } = useI18n()
const themeStore = useThemeStore()

const twoFactor = ref(false)

const sectionLabelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')

const formatLastActive = (minutes) => {
  if (!minutes) return ''
  if (minutes < 60) return t('settings.activeAgoMinutes', { count: minutes })
  return t('settings.activeAgoHours', { count: Math.floor(minutes / 60) })
}

const sessionDescription = (session) =>
  `${session.location} • ${session.isCurrent ? t('settings.currentSession') : formatLastActive(session.lastActive)}`
</script>

<template>
  <!-- AUTH -->
  <Card v-if="showSection('auth')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.authAccess') }}</h3>
    <div class="flex flex-col">
      <SettingItem :icon="KeyRound" :title="t('settings.password')" :description="t('settings.passwordUpdated')">
        <Button variant="outline" size="sm">{{ t('common.change') }}</Button>
      </SettingItem>
      <SettingItem :icon="Lock" :title="t('settings.twoFactor')" :description="t('settings.twoFactorDesc')" last>
        <Toggle :active="twoFactor" @toggle="twoFactor = !twoFactor" />
      </SettingItem>
    </div>
  </Card>

  <!-- SESSIONS -->
  <Card v-if="showSection('sessions')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.activeSessions') }}</h3>
    <div class="flex flex-col">
      <SettingItem
        v-for="(session, idx) in SESSIONS"
        :key="session.id"
        :icon="session.icon === 'desktop' ? MonitorSmartphone : Smartphone"
        :title="session.device"
        :description="sessionDescription(session)"
        :last="idx === SESSIONS.length - 1"
      >
        <Badge v-if="session.isCurrent" variant="success">{{ t('settings.currentSession') }}</Badge>
        <Button v-else variant="danger" size="sm" class="!py-1.5 !px-3">{{ t('common.revoke') }}</Button>
      </SettingItem>
    </div>
  </Card>
</template>
