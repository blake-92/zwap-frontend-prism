<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  User, Shield, CreditCard, Bell, Save,
  Smartphone, KeyRound, MonitorSmartphone, Mail, Lock, Globe,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useToastStore } from '~/stores/toast'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { SPRING } from '~/utils/springs'
import { CURRENT_USER, PLAN_INFO, SESSIONS, PAYMENT_CARD } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import { Zap } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Toggle from '~/components/ui/Toggle.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import Badge from '~/components/ui/Badge.vue'
import PageHeader from '~/components/ui/PageHeader.vue'

const mv = useMotionVariants()
const { t, locale, setLocale } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const toastStore = useToastStore()
const viewSearch = useViewSearch(computed(() => t('settings.searchPlaceholder')))

const activeTab = ref('perfil')
const alertEmails = ref(true)
const pushNotifs = ref(false)
const twoFactor = ref(false)

const formatLastActive = (minutes) => {
  if (!minutes) return ''
  if (minutes < 60) return t('settings.activeAgoMinutes', { count: minutes })
  return t('settings.activeAgoHours', { count: Math.floor(minutes / 60) })
}

const TABS = computed(() => [
  { id: 'perfil', label: t('settings.tabProfile'), icon: User },
  { id: 'seguridad', label: t('settings.tabSecurity'), icon: Shield },
  { id: 'facturacion', label: t('settings.tabBilling'), icon: CreditCard },
])

const handleSave = () => toastStore.addToast(t('settings.changesSaved'), 'success')

const search = computed(() => viewSearch.query)

const sections = computed(() => [
  { id: 'personal-info', tab: 'perfil', keywords: [t('settings.personalInfo'), t('users.fullName'), t('users.role'), t('users.emailLabel'), CURRENT_USER.name, CURRENT_USER.email, t('users.roleAdmin')] },
  { id: 'notifications', tab: 'perfil', keywords: [t('settings.notificationPrefs'), t('settings.paymentAlerts'), t('settings.paymentAlertsDesc'), t('settings.pushNotifications'), t('settings.pushNotificationsDesc')] },
  { id: 'language', tab: 'perfil', keywords: [t('settings.language'), t('settings.languageDesc'), t('settings.languageEs'), t('settings.languageEn')] },
  { id: 'performance', tab: 'perfil', keywords: [t('settings.performance'), t('settings.liteMode'), t('settings.liteModeDesc')] },
  { id: 'auth', tab: 'seguridad', keywords: [t('settings.authAccess'), t('settings.password'), t('settings.passwordUpdated'), t('settings.twoFactor'), t('settings.twoFactorDesc')] },
  { id: 'sessions', tab: 'seguridad', keywords: [t('settings.activeSessions'), ...SESSIONS.map(s => s.device), ...SESSIONS.map(s => s.location)] },
  { id: 'billing', tab: 'facturacion', keywords: [t('settings.paymentMethods'), t('settings.currentPlan'), t('settings.managePlan'), PLAN_INFO.name, PLAN_INFO.tier, PAYMENT_CARD.brand] },
])

const isSearching = computed(() => !!search.value)
const visibleSections = computed(() => {
  if (!search.value) return null
  const q = search.value.toLowerCase()
  return new Set(sections.value.filter(s => s.keywords.some(kw => kw.toLowerCase().includes(q))).map(s => s.id))
})

const showSection = (id, tab) => {
  if (isSearching.value) return visibleSections.value?.has(id) ?? false
  return activeTab.value === tab
}

const noResults = computed(() => isSearching.value && visibleSections.value?.size === 0)

const tabsWrapperClass = computed(() => themeStore.isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-200/50 border border-black/5')
const tabActiveClass = computed(() => themeStore.isDarkMode ? 'bg-[#252429] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-white border border-[#7C3AED]/20 shadow-xs')
const tabTextClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'text-white' : 'text-[#7C3AED]'
  return themeStore.isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]'
}
const sectionLabelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const borderSecondary = computed(() => themeStore.isDarkMode ? 'border-white/5' : 'border-black/5')

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
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit" class="max-w-4xl mx-auto">
    <PageHeader :title="t('settings.title')" />

    <AnimatePresence>
      <motion.div
        v-if="!isSearching"
        :initial="{ opacity: 0, height: 0 }"
        :animate="{ opacity: 1, height: 'auto' }"
        :exit="{ opacity: 0, height: 0 }"
        :transition="SPRING"
        class="overflow-hidden mb-6"
      >
        <div :class="['flex gap-2 p-1 rounded-xl inline-flex', tabsWrapperClass]">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            :class="['relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300', tabTextClass(activeTab === tab.id)]"
            @click="activeTab = tab.id"
          >
            <motion.div
              v-if="activeTab === tab.id"
              layout-id="settingsTabIndicator"
              :class="['absolute inset-0 rounded-lg', tabActiveClass]"
              :transition="SPRING"
            />
            <span class="relative z-10 flex items-center gap-2">
              <component :is="tab.icon" :size="16" />
              {{ tab.label }}
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>

    <div class="space-y-6">
      <!-- PERSONAL INFO -->
      <Card v-if="showSection('personal-info', 'perfil')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.personalInfo') }}</h3>
        <div class="flex flex-col sm:flex-row gap-8 items-start mb-8">
          <div class="relative group cursor-pointer">
            <div :class="[
              'w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-2xl transition-colors',
              themeStore.isDarkMode
                ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-xs'
            ]">{{ CURRENT_USER.initials }}</div>
            <div class="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold backdrop-blur-xs">
              {{ t('common.change') }}
            </div>
          </div>
          <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="settings-name" :class="['block text-xs font-bold tracking-widest mb-2', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('users.fullName') }}</label>
              <Input id="settings-name" :model-value="CURRENT_USER.name" />
            </div>
            <div>
              <label for="settings-role" :class="['block text-xs font-bold tracking-widest mb-2', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('users.role') }}</label>
              <Input id="settings-role" :model-value="t('users.roleAdmin')" disabled />
            </div>
            <div class="md:col-span-2">
              <label for="settings-email" :class="['block text-xs font-bold tracking-widest mb-2', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('users.emailLabel') }}</label>
              <Input id="settings-email" :icon="Mail" :model-value="CURRENT_USER.email" />
            </div>
          </div>
        </div>
        <div :class="['pt-6 border-t flex justify-end', borderSecondary]">
          <Button @click="handleSave"><Save :size="16" /> {{ t('common.save') }}</Button>
        </div>
      </Card>

      <!-- NOTIFICATIONS -->
      <Card v-if="showSection('notifications', 'perfil')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.notificationPrefs') }}</h3>
        <div class="flex flex-col">
          <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <Bell :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.paymentAlerts') }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.paymentAlertsDesc') }}</p>
              </div>
            </div>
            <div class="shrink-0"><Toggle :active="alertEmails" @toggle="alertEmails = !alertEmails" /></div>
          </div>
          <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <Smartphone :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.pushNotifications') }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.pushNotificationsDesc') }}</p>
              </div>
            </div>
            <div class="shrink-0"><Toggle :active="pushNotifs" @toggle="pushNotifs = !pushNotifs" /></div>
          </div>
        </div>
      </Card>

      <!-- LANGUAGE -->
      <Card v-if="showSection('language', 'perfil')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.language') }}</h3>
        <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
          <div class="flex gap-4">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
              <Globe :size="18" />
            </div>
            <div>
              <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.language') }}</h4>
              <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.languageDesc') }}</p>
            </div>
          </div>
          <div class="shrink-0">
            <div :class="['flex rounded-xl overflow-hidden border', themeStore.isDarkMode ? 'border-white/10' : 'border-black/10']">
              <button :class="['px-4 py-2 text-sm font-bold transition-colors', langBtnClass('es')]" @click="setLocale('es')">{{ t('settings.languageEs') }}</button>
              <button :class="['px-4 py-2 text-sm font-bold transition-colors border-l', langBtnClass('en'), themeStore.isDarkMode ? 'border-white/10' : 'border-black/10']" @click="setLocale('en')">{{ t('settings.languageEn') }}</button>
            </div>
          </div>
        </div>
      </Card>

      <!-- PERFORMANCE -->
      <Card v-if="showSection('performance', 'perfil')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-2', sectionLabelClass]">{{ t('settings.performance') }}</h3>
        <div class="py-5 flex flex-col gap-4">
          <div class="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <Zap :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.liteMode') }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ perfDesc }}</p>
              </div>
            </div>
            <div class="shrink-0 w-full sm:w-auto">
              <SegmentControl v-model="perfTier" :options="perfOptions" layout-id="perfTierIndicator" />
            </div>
          </div>
        </div>
      </Card>

      <!-- AUTH -->
      <Card v-if="showSection('auth', 'seguridad')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.authAccess') }}</h3>
        <div class="flex flex-col">
          <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <KeyRound :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.password') }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.passwordUpdated') }}</p>
              </div>
            </div>
            <div class="shrink-0"><Button variant="outline" size="sm">{{ t('common.change') }}</Button></div>
          </div>
          <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <Lock :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ t('settings.twoFactor') }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.twoFactorDesc') }}</p>
              </div>
            </div>
            <div class="shrink-0"><Toggle :active="twoFactor" @toggle="twoFactor = !twoFactor" /></div>
          </div>
        </div>
      </Card>

      <!-- SESSIONS -->
      <Card v-if="showSection('sessions', 'seguridad')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.activeSessions') }}</h3>
        <div class="flex flex-col">
          <div
            v-for="session in SESSIONS"
            :key="session.id"
            :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]"
          >
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <component :is="session.icon === 'desktop' ? MonitorSmartphone : Smartphone" :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ session.device }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ session.location }} • {{ session.isCurrent ? t('settings.currentSession') : formatLastActive(session.lastActive) }}
                </p>
              </div>
            </div>
            <div class="shrink-0">
              <Badge v-if="session.isCurrent" variant="success">{{ t('settings.currentSession') }}</Badge>
              <Button v-else variant="danger" size="sm" class="!py-1.5 !px-3">{{ t('common.revoke') }}</Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- BILLING -->
      <Card v-if="showSection('billing', 'facturacion')" class="p-6 md:p-8">
        <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.paymentMethods') }}</h3>
        <div :class="['p-6 rounded-2xl border mb-6 flex justify-between items-center', themeStore.isDarkMode ? 'bg-[#111113]/50 border-white/10' : 'bg-gray-50 border-gray-200']">
          <div>
            <p :class="['text-xs font-bold tracking-widest uppercase mb-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('settings.currentPlan') }}</p>
            <h4 :class="['text-xl font-bold flex items-center gap-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
              {{ PLAN_INFO.name }} <Badge variant="default">{{ PLAN_INFO.tier }}</Badge>
            </h4>
            <p :class="['text-sm mt-1 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ PLAN_INFO.renewDate }} ({{ PLAN_INFO.price }})</p>
          </div>
          <Button variant="outline">{{ t('settings.managePlan') }}</Button>
        </div>
        <div class="flex flex-col">
          <div :class="['py-5 flex items-start sm:items-center justify-between gap-4 border-b last:border-0', borderSecondary]">
            <div class="flex gap-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]']">
                <CreditCard :size="18" />
              </div>
              <div>
                <h4 :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ PAYMENT_CARD.brand }} ••{{ PAYMENT_CARD.last4 }}</h4>
                <p :class="['text-xs mt-0.5 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ t('settings.expiration') }}: {{ PAYMENT_CARD.expiry }} • {{ PAYMENT_CARD.isPrimary ? t('settings.primaryCard') : t('settings.secondaryCard') }}
                </p>
              </div>
            </div>
            <div class="shrink-0"><Button variant="outline" size="sm">{{ t('common.update') }}</Button></div>
          </div>
        </div>
      </Card>

      <!-- No results -->
      <Card v-if="noResults" class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ t('settings.noResultsFor', { term: search }) }}
        </p>
      </Card>
    </div>
  </motion.div>
</template>
