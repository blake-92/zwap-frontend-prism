<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence, LayoutGroup } from 'motion-v'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2, LogOut, Wallet, ArrowRight,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { ROUTES } from '~/utils/routes'
import { CURRENT_USER, WALLET_BALANCE } from '~/utils/mockData'
import { SPRING_SIDEBAR as SPRING } from '~/utils/springs'
import ZwapIsotipo from '~/components/brand/ZwapIsotipo.vue'
import ZwapWordmark from '~/components/brand/ZwapWordmark.vue'
import Avatar from '~/components/ui/Avatar.vue'

defineProps({
  isCollapsed: { type: Boolean, default: false },
})

const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const route = useRoute()
const token = useCookie('zwap_token', {
  sameSite: 'lax',
  secure: !import.meta.dev,
  path: '/',
})

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, route: ROUTES.DASHBOARD },
  { id: 'links', labelKey: 'nav.links', icon: LinkIcon, route: ROUTES.LINKS },
  { id: 'transacciones', labelKey: 'nav.transactions', icon: ArrowRightLeft, route: ROUTES.TRANSACTIONS },
  { id: 'liquidaciones', labelKey: 'nav.settlements', icon: Landmark, route: ROUTES.SETTLEMENTS },
  { id: 'usuarios', labelKey: 'nav.users', icon: Users, route: ROUTES.USERS },
  { id: 'sucursales', labelKey: 'nav.branches', icon: Building2, route: ROUTES.BRANCHES },
]

const LABEL_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(4px)', x: -8 },
  show: { opacity: 1, filter: 'blur(0px)', x: 0, transition: { type: 'spring', stiffness: 400, damping: 30, delay: 0.06 } },
  exit: { opacity: 0, filter: 'blur(4px)', x: -8, transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

const CONTENT_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(3px)' },
  show: { opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 380, damping: 30, delay: 0.1 } },
  exit: { opacity: 0, filter: 'blur(3px)', transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

const isWalletActive = computed(() => route.path === ROUTES.WALLET)
const walletHover = ref(false)

const goTo = (r) => navigateTo(r)

const logout = () => {
  token.value = null
  navigateTo(ROUTES.LOGIN)
}

const asideClass = computed(() => {
  const useBlur = perfStore.useBlur
  const bgDark = useBlur ? 'bg-[#111113]/20' : 'bg-[#1A1A1D]'
  const bgLight = useBlur ? 'bg-white/40' : 'bg-white'
  if (themeStore.isDarkMode) {
    return `${bgDark} backdrop-blur-2xl border-r border-white/10`
  }
  return `${bgLight} backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_30px_rgba(0,0,0,0.03)]`
})

const walletBtnClass = (collapsed) => {
  if (collapsed) return 'border-transparent bg-transparent shadow-none'
  const neon = perfStore.useNeon
  const isLite = perfStore.isLite
  if (isWalletActive.value) {
    if (themeStore.isDarkMode) {
      if (isLite) return 'bg-[#252429] border-[#7C3AED]/50'
      return `bg-[#252429]/60 border-[#7C3AED]/50${neon ? ' shadow-[0_0_16px_rgba(124,58,237,0.2)]' : ''}`
    }
    if (isLite) return 'bg-[#F8F7FB] border-[#7C3AED]/40'
    return `bg-white/80 border-[#7C3AED]/40${neon ? ' shadow-[0_0_12px_rgba(124,58,237,0.15)]' : ''}`
  }
  // Inactive
  if (themeStore.isDarkMode) {
    if (isLite) return 'bg-[#1A1A1D] border-white/15 hover:border-[#7C3AED]/30'
    return 'bg-[#252429]/20 border-white/10 hover:bg-[#252429]/40 hover:border-[#7C3AED]/30'
  }
  if (isLite) return 'bg-[#F8F7FB] border-[#DBD3FB] hover:border-[#7C3AED]/30'
  return 'bg-white/40 border-white hover:bg-white/60 hover:border-[#7C3AED]/20'
}

const navItemClass = (active) => {
  if (active) return themeStore.isDarkMode ? 'text-white' : 'text-[#561BAF]'
  return themeStore.isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
}

const indicatorClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/40 border border-white/10 border-t-white/20 shadow-xl shadow-black/30 backdrop-blur-md'
    : 'bg-white/60 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur-md',
)

const glowClass = (collapsed) => {
  if (collapsed) return 'bg-transparent'
  if (isWalletActive.value) return themeStore.isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
  return walletHover.value ? 'bg-[#7C3AED]/15' : 'bg-transparent'
}
</script>

<template>
  <motion.aside
    :animate="{ width: isCollapsed ? 72 : 256 }"
    :transition="SPRING"
    :class="['relative shrink-0 flex flex-col h-screen z-20 overflow-hidden transition-colors duration-300', asideClass]"
  >
    <!-- Logo -->
    <div class="h-20 flex items-center shrink-0 overflow-hidden pl-[19px]">
      <ZwapIsotipo wrapper-class="h-7 w-auto shrink-0" />
      <AnimatePresence :initial="false">
        <motion.div
          v-if="!isCollapsed"
          key="wordmark"
          :variants="LABEL_VARIANTS"
          initial="hidden"
          animate="show"
          exit="exit"
          class="overflow-hidden -ml-[2.4px]"
        >
          <ZwapWordmark wrapper-class="h-[18px]" />
        </motion.div>
      </AnimatePresence>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
      <LayoutGroup id="sidebar-nav">
        <button
          v-for="item in NAV_ITEMS"
          :key="item.id"
          :title="isCollapsed ? t(item.labelKey) : undefined"
          :class="['relative w-full h-11 flex items-center gap-3 py-3 pl-[19px] rounded-xl text-sm font-medium transition-colors duration-200', navItemClass(route.path === item.route)]"
          @click="goTo(item.route)"
        >
          <!-- Ambient halo (solo Prism) — blob púrpura blurreado DETRÁS del pill -->
          <motion.div
            v-if="route.path === item.route && perfStore.useActiveHalo"
            :layout-id="perfStore.useNavMorphs ? 'sidebar-indicator-halo' : undefined"
            class="absolute inset-0 rounded-xl bg-[#7C3AED]/25 blur-xl pointer-events-none"
            :transition="SPRING"
            aria-hidden="true"
          />
          <motion.div
            v-if="route.path === item.route"
            :layout-id="perfStore.useNavMorphs ? 'sidebar-indicator' : undefined"
            :class="['absolute inset-0 rounded-xl', indicatorClass]"
            :transition="SPRING"
          />
          <component
            :is="item.icon"
            :size="18"
            :class="['relative z-10 shrink-0', route.path === item.route ? 'text-[#7C3AED]' : 'opacity-70']"
          />
          <AnimatePresence :initial="false">
            <motion.span
              v-if="!isCollapsed"
              key="label"
              :variants="LABEL_VARIANTS"
              initial="hidden"
              animate="show"
              exit="exit"
              class="relative z-10 whitespace-nowrap overflow-hidden"
            >
              {{ t(item.labelKey) }}
            </motion.span>
          </AnimatePresence>
        </button>
      </LayoutGroup>
    </nav>

    <!-- Footer -->
    <div class="px-2 pb-5 space-y-3 shrink-0">
      <!-- Wallet -->
      <motion.button
        :animate="{ y: !isWalletActive && walletHover && !isCollapsed ? -3 : 0 }"
        :transition="SPRING"
        :title="isCollapsed ? t('nav.myWallet') : undefined"
        :class="['relative w-full h-14 flex items-center pl-[19px] pr-3 py-3 mb-1 rounded-xl border overflow-hidden transition-[border-color,background-color,box-shadow] duration-200', walletBtnClass(isCollapsed)]"
        @click="goTo(ROUTES.WALLET)"
        @mouseenter="walletHover = true"
        @mouseleave="walletHover = false"
      >
        <Wallet
          :size="18"
          :class="['relative z-10 shrink-0', isWalletActive ? 'text-[#7C3AED]' : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]']"
        />

        <AnimatePresence :initial="false">
          <motion.div
            v-if="!isCollapsed"
            key="wallet-info"
            :variants="LABEL_VARIANTS"
            initial="hidden"
            animate="show"
            exit="exit"
            class="absolute inset-y-0 left-[49px] right-3 flex items-center justify-between overflow-hidden"
          >
            <div class="text-left min-w-0">
              <p :class="[
                'text-[10px] font-bold tracking-widest uppercase leading-tight',
                isWalletActive
                  ? themeStore.isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'
                  : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
              ]">{{ t('nav.myWallet') }}</p>
              <span :class="['text-sm font-mono font-bold tracking-tight block leading-snug', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
                {{ WALLET_BALANCE.short }}
              </span>
            </div>

            <motion.div
              :animate="(isWalletActive || walletHover) ? { x: 0, opacity: 1 } : { x: -8, opacity: 0 }"
              :transition="SPRING"
              :class="[
                'shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                isWalletActive
                  ? themeStore.isDarkMode
                    ? `bg-[#7C3AED] text-white${perfStore.useNeon ? ' shadow-[0_0_12px_rgba(124,58,237,0.5)]' : ' shadow-md'}`
                    : 'bg-[#7C3AED] text-white shadow-md'
                  : 'bg-transparent text-[#888991]'
              ]"
            >
              <ArrowRight :size="14" :stroke-width="3" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <!-- Glow bubble solo en Prism/Normal — filter:blur en Lite ya se strippea vía CSS,
             pero el DOM y el compositing layer persisten. v-if lo elimina completamente. -->
        <div
          v-if="perfStore.useWalletGlowBubble"
          :class="['absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none transition-[opacity] duration-500', glowClass(isCollapsed)]"
        />
      </motion.button>

      <!-- User row -->
      <div class="relative h-[52px] flex items-center py-2 pl-[10px] rounded-xl transition-colors duration-200 overflow-hidden">
        <Avatar initials="A" size="sm" variant="neutral" />

        <AnimatePresence :initial="false">
          <motion.div
            v-if="!isCollapsed"
            key="user-info"
            :variants="CONTENT_VARIANTS"
            initial="hidden"
            animate="show"
            exit="exit"
            class="absolute inset-y-0 left-[58px] right-2 flex items-center justify-between overflow-hidden"
          >
            <div class="min-w-0">
              <p :class="['text-sm font-bold truncate leading-tight', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
                {{ CURRENT_USER.displayName }}
              </p>
              <p :class="['text-[11px] font-medium whitespace-nowrap', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                {{ t('nav.logout') }}
              </p>
            </div>
            <button
              :title="t('nav.logout')"
              :class="[
                'p-1.5 rounded-lg shrink-0 transition-colors duration-200',
                themeStore.isDarkMode
                  ? 'text-[#888991] hover:text-rose-400 hover:bg-rose-500/10'
                  : 'text-[#67656E] hover:text-rose-600 hover:bg-rose-50'
              ]"
              @click="logout"
            >
              <LogOut :size="16" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </motion.aside>
</template>
