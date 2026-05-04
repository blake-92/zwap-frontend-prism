<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence, LayoutGroup } from 'motion-v'
import {
  LayoutDashboard, ArrowRightLeft, Link as LinkIcon, Landmark,
  MoreHorizontal, Building2, Users, Wallet, Settings,
  Sun, Moon, Bell,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useSessionStore } from '~/stores/session'
import { useModalOpen } from '~/composables/useModalOpen'
import { useScrollLock } from '~/composables/useScrollLock'
import { ROUTES } from '~/utils/routes'
import { SPRING } from '~/utils/springs'

const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const sessionStore = useSessionStore()
const route = useRoute()
const modalOpen = useModalOpen()
const sheetOpen = ref(false)

useScrollLock(sheetOpen)

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}
const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: SPRING },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 36 } },
}

// `permission` debe coincidir con `requiresPermission` de la page (Plan C). null = todos.
const TABS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, route: ROUTES.DASHBOARD, permission: null },
  { id: 'transacciones', labelKey: 'nav.transactions', icon: ArrowRightLeft, route: ROUTES.TRANSACTIONS, permission: 'TRANSACTIONS_VIEW' },
  { id: 'links', labelKey: 'nav.linksShort', icon: LinkIcon, route: ROUTES.LINKS, permission: 'LINKS_VIEW' },
  { id: 'liquidaciones', labelKey: 'nav.settlements', icon: Landmark, route: ROUTES.SETTLEMENTS, permission: 'SETTLEMENTS_VIEW' },
]

const MORE_ITEMS = [
  { id: 'sucursales', labelKey: 'nav.branches', icon: Building2, route: ROUTES.BRANCHES, permission: 'BRANCHES_MANAGE' },
  { id: 'usuarios', labelKey: 'nav.users', icon: Users, route: ROUTES.USERS, permission: 'USERS_VIEW' },
  { id: 'wallet', labelKey: 'nav.wallet', icon: Wallet, route: ROUTES.WALLET, permission: 'WALLET_VIEW' },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings, route: ROUTES.SETTINGS, permission: null },
]

const visibleTabs = computed(() =>
  TABS.filter((t) => !t.permission || sessionStore.hasPermission(t.permission)),
)
const visibleMore = computed(() =>
  MORE_ITEMS.filter((t) => !t.permission || sessionStore.hasPermission(t.permission)),
)

const isMoreActive = computed(() => visibleMore.value.some(i => route.path === i.route))

const handleNav = (r) => {
  navigateTo(r)
  sheetOpen.value = false
}

const handleDragEnd = (_e, info) => {
  if (info.offset.y > 100 || info.velocity.y > 500) sheetOpen.value = false
}

const navClass = computed(() => {
  const useBlur = perfStore.useBlur
  const saturate = perfStore.chromeSaturate ? 'backdrop-saturate-150' : ''
  const bgDark = useBlur ? 'bg-[#111113]/45' : 'bg-[#1A1A1D]'
  const bgLight = useBlur ? 'bg-white/50' : 'bg-white'
  return [
    `fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around border-t backdrop-blur-2xl ${saturate} pb-[env(safe-area-inset-bottom)] transition-[filter] duration-150`,
    // Sin blur-xs propio — el backdrop del modal hace el work. Solo desaturamos.
    modalOpen.value ? 'saturate-50 pointer-events-none' : '',
    themeStore.isDarkMode
      ? `${bgDark} border-white/10 border-t-white/15`
      : `${bgLight} border-black/5 border-t-white/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]`,
  ]
})

const pillClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20'
    : 'bg-[#DBD3FB]/40 border border-[#7C3AED]/10',
)

const sheetClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#1A1A1D] border-white/10'
    : 'bg-white border-black/5 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]',
)

const tabTextClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
  return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
}

const moreTabTextClass = computed(() =>
  (isMoreActive.value || sheetOpen.value)
    ? themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
    : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)

const moreItemClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#A78BFA]' : 'bg-[#DBD3FB]/40 text-[#7C3AED]'
  return themeStore.isDarkMode ? 'text-[#888991] hover:bg-white/5' : 'text-[#67656E] hover:bg-black/5'
}
const moreIconBubbleClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'bg-[#7C3AED]/20' : 'bg-[#7C3AED]/10'
  return themeStore.isDarkMode ? 'bg-white/5' : 'bg-black/5'
}
</script>

<template>
  <!-- Bottom bar -->
  <nav :class="navClass">
    <LayoutGroup id="bottomnav">
      <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        :class="['flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pt-3 relative', tabTextClass(route.path === tab.route)]"
        @click="handleNav(tab.route)"
      >
        <!-- Ambient halo (solo Prism) -->
        <motion.div
          v-if="route.path === tab.route && perfStore.useActiveHalo"
          :layout-id="perfStore.useNavMorphs ? 'bottomnav-pill-halo' : undefined"
          class="absolute inset-x-2 inset-y-1.5 rounded-2xl bg-[#7C3AED]/25 blur-xl pointer-events-none"
          :transition="SPRING"
          aria-hidden="true"
        />
        <motion.div
          v-if="route.path === tab.route"
          :layout-id="perfStore.useNavMorphs ? 'bottomnav-pill' : undefined"
          :class="['absolute inset-x-2 inset-y-1.5 rounded-2xl', pillClass]"
          :transition="SPRING"
        />
        <component :is="tab.icon" :size="20" :stroke-width="route.path === tab.route ? 2.5 : 2" class="relative z-10" />
        <span :class="['text-[10px] leading-none relative z-10', route.path === tab.route ? 'font-bold' : 'font-medium']">
          {{ t(tab.labelKey) }}
        </span>
      </button>

      <!-- More tab -->
      <button
        :class="['flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pt-3 relative', moreTabTextClass]"
        @click="sheetOpen = !sheetOpen"
      >
        <motion.div
          v-if="isMoreActive && !sheetOpen && perfStore.useActiveHalo"
          :layout-id="perfStore.useNavMorphs ? 'bottomnav-pill-halo' : undefined"
          class="absolute inset-x-2 inset-y-1.5 rounded-2xl bg-[#7C3AED]/25 blur-xl pointer-events-none"
          :transition="SPRING"
          aria-hidden="true"
        />
        <motion.div
          v-if="isMoreActive && !sheetOpen"
          :layout-id="perfStore.useNavMorphs ? 'bottomnav-pill' : undefined"
          :class="['absolute inset-x-2 inset-y-1.5 rounded-2xl', pillClass]"
          :transition="SPRING"
        />
        <MoreHorizontal :size="20" :stroke-width="isMoreActive || sheetOpen ? 2.5 : 2" class="relative z-10" />
        <span :class="['text-[10px] leading-none relative z-10', isMoreActive || sheetOpen ? 'font-bold' : 'font-medium']">
          {{ t('nav.moreShort') }}
        </span>
      </button>
    </LayoutGroup>
  </nav>

  <ClientOnly>
    <Teleport to="body">
      <AnimatePresence>
        <motion.div
          v-if="sheetOpen"
          key="sheet-backdrop"
          :variants="backdropVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs"
          @click="sheetOpen = false"
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          v-if="sheetOpen"
          key="sheet-panel"
          :variants="sheetVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
          drag="y"
          :drag-constraints="{ top: 0 }"
          :drag-elastic="0.2"
          :drag-snap-to-origin="true"
          :class="['fixed bottom-0 inset-x-0 z-[35] rounded-t-2xl border-t pb-[calc(68px+env(safe-area-inset-bottom))]', sheetClass]"
          @drag-end="handleDragEnd"
        >
          <div class="flex justify-center py-3">
            <div :class="['w-10 h-1 rounded-full', themeStore.isDarkMode ? 'bg-white/20' : 'bg-black/10']" />
          </div>

          <h3 :class="['px-5 py-3 text-sm font-bold opacity-50', themeStore.isDarkMode ? 'text-white' : 'text-black']">
            {{ t('nav.moreOptions') }}
          </h3>

          <div class="px-4 grid grid-cols-4 gap-2">
            <button
              v-for="item in visibleMore"
              :key="item.id"
              :class="['flex flex-col items-center gap-2 py-4 rounded-xl transition-colors', moreItemClass(route.path === item.route)]"
              @click="handleNav(item.route)"
            >
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', moreIconBubbleClass(route.path === item.route)]">
                <component :is="item.icon" :size="20" :stroke-width="route.path === item.route ? 2.5 : 2" />
              </div>
              <span :class="['text-[11px] leading-none', route.path === item.route ? 'font-bold' : 'font-medium']">
                {{ t(item.labelKey) }}
              </span>
            </button>
          </div>

          <div :class="['mx-5 my-3 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']" />

          <div class="px-4 grid grid-cols-4 gap-2">
            <button
              :class="['flex flex-col items-center gap-2 py-4 rounded-xl transition-colors', themeStore.isDarkMode ? 'text-[#888991] hover:bg-white/5' : 'text-[#67656E] hover:bg-black/5']"
              @click="themeStore.toggleTheme()"
            >
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', themeStore.isDarkMode ? 'bg-white/5' : 'bg-black/5']">
                <component :is="themeStore.isDarkMode ? Sun : Moon" :size="20" />
              </div>
              <span class="text-[11px] leading-none font-medium">{{ t('nav.theme') }}</span>
            </button>

            <button :class="['flex flex-col items-center gap-2 py-4 rounded-xl transition-colors', themeStore.isDarkMode ? 'text-[#888991] hover:bg-white/5' : 'text-[#67656E] hover:bg-black/5']">
              <div :class="['relative w-10 h-10 rounded-xl flex items-center justify-center', themeStore.isDarkMode ? 'bg-white/5' : 'bg-black/5']">
                <Bell :size="20" />
                <span :class="[
                  'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-[2px]',
                  themeStore.isDarkMode
                    ? `bg-[#7C3AED] border-[#1A1A1D]${perfStore.useNeon ? ' shadow-[0_0_10px_rgba(124,58,237,0.9)]' : ''}`
                    : `bg-red-500 border-white${perfStore.useNeon ? ' shadow-[0_0_10px_rgba(239,68,68,0.6)]' : ''}`
                ]" />
              </div>
              <span class="text-[11px] leading-none font-medium">{{ t('nav.notifications') }}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Teleport>
  </ClientOnly>
</template>
