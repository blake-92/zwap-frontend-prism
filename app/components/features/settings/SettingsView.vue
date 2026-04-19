<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { User, Shield, CreditCard } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { SPRING } from '~/utils/springs'
import { CURRENT_USER, PLAN_INFO, SESSIONS, PAYMENT_CARD } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import SettingsProfileTab from './SettingsProfileTab.vue'
import SettingsSecurityTab from './SettingsSecurityTab.vue'
import SettingsBillingTab from './SettingsBillingTab.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const viewSearch = useViewSearch(computed(() => t('settings.searchPlaceholder')))

const activeTab = ref('perfil')

const TABS = computed(() => [
  { id: 'perfil', label: t('settings.tabProfile'), icon: User },
  { id: 'seguridad', label: t('settings.tabSecurity'), icon: Shield },
  { id: 'facturacion', label: t('settings.tabBilling'), icon: CreditCard },
])

const search = computed(() => viewSearch.query)

// Keywords por sección — indexan todo el texto visible para que la búsqueda contextual
// encuentre cualquier label/valor ("roleAdmin", nombre de usuario, sesiones, etc.).
const sections = computed(() => [
  { id: 'personal-info', tab: 'perfil', keywords: [t('settings.personalInfo'), t('users.fullName'), t('users.role'), t('users.emailLabel'), CURRENT_USER.name, CURRENT_USER.email, t('users.roleAdmin')] },
  { id: 'notifications',  tab: 'perfil', keywords: [t('settings.notificationPrefs'), t('settings.paymentAlerts'), t('settings.paymentAlertsDesc'), t('settings.pushNotifications'), t('settings.pushNotificationsDesc')] },
  { id: 'language',       tab: 'perfil', keywords: [t('settings.language'), t('settings.languageDesc'), t('settings.languageEs'), t('settings.languageEn')] },
  { id: 'performance',    tab: 'perfil', keywords: [t('settings.performance'), t('settings.liteMode'), t('settings.liteModeDesc')] },
  { id: 'auth',           tab: 'seguridad', keywords: [t('settings.authAccess'), t('settings.password'), t('settings.passwordUpdated'), t('settings.twoFactor'), t('settings.twoFactorDesc')] },
  { id: 'sessions',       tab: 'seguridad', keywords: [t('settings.activeSessions'), ...SESSIONS.map(s => s.device), ...SESSIONS.map(s => s.location)] },
  { id: 'billing',        tab: 'facturacion', keywords: [t('settings.paymentMethods'), t('settings.currentPlan'), t('settings.managePlan'), PLAN_INFO.name, PLAN_INFO.tier, PAYMENT_CARD.brand] },
])

const isSearching = computed(() => !!search.value)
const visibleSections = computed(() => {
  if (!search.value) return null
  const q = search.value.toLowerCase()
  return new Set(sections.value.filter(s => s.keywords.some(kw => kw.toLowerCase().includes(q))).map(s => s.id))
})
const showSection = (id) => {
  const section = sections.value.find(s => s.id === id)
  if (!section) return false
  if (isSearching.value) return visibleSections.value?.has(id) ?? false
  return activeTab.value === section.tab
}
const noResults = computed(() => isSearching.value && visibleSections.value?.size === 0)

const tabsWrapperClass = computed(() => themeStore.isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-200/50 border border-black/5')
const tabActiveClass = computed(() => themeStore.isDarkMode ? 'bg-[#252429] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-white border border-[#7C3AED]/20 shadow-xs')
const tabTextClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'text-white' : 'text-[#7C3AED]'
  return themeStore.isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]'
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
      <SettingsProfileTab :show-section="showSection" />
      <SettingsSecurityTab :show-section="showSection" />
      <SettingsBillingTab :show-section="showSection" />

      <Card v-if="noResults" class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ t('settings.noResultsFor', { term: search }) }}
        </p>
      </Card>
    </div>
  </motion.div>
</template>
