<script setup>
import { ref, computed, onMounted, onUnmounted, useId, watch, nextTick } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  Search, Moon, Sun, Bell, ChevronDown, Building2,
  Settings, SlidersHorizontal, X, Check,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useViewSearchStore } from '~/stores/viewSearch'
import { useSessionStore } from '~/stores/session'
import { useBranchesStore } from '~/stores/branches'
import { ROUTES } from '~/utils/routes'
import { SPRING, SPRING_SIDEBAR } from '~/utils/springs'
import { getDropdownGlass } from '~/utils/cardClasses'
import Button from '~/components/ui/Button.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import BottomSheet from '~/components/ui/BottomSheet.vue'
import ZwapIsotipo from '~/components/brand/ZwapIsotipo.vue'
import ZwapWordmark from '~/components/brand/ZwapWordmark.vue'

const props = defineProps({
  isDesktop: { type: Boolean, default: true },
  headerVisible: { type: Boolean, default: true },
})

const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const viewSearch = useViewSearchStore()
const sessionStore = useSessionStore()
const branchesStore = useBranchesStore()
const menuOpen = ref(false)
const branchSheetOpen = ref(false)
const searchExpanded = ref(false)
const menuRef = ref(null)
const searchInputRef = ref(null)
const pillId = useId()
// iOS notch height. motion-v no evalúa env() dentro de animate strings —
// leemos el CSS var --sat una vez en mount para sumarlo al translate de hide.
const safeTop = ref(0)

const WORDMARK_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(4px)', x: -8 },
  show: { opacity: 1, filter: 'blur(0px)', x: 0, transition: { type: 'spring', stiffness: 400, damping: 30, delay: 0.06 } },
  exit: { opacity: 0, filter: 'blur(4px)', x: -8, transition: { type: 'spring', stiffness: 320, damping: 28 } },
}
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING, stiffness: 500 } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

const handler = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) menuOpen.value = false
}

let focusTid = null

onMounted(() => {
  if (typeof document !== 'undefined') document.addEventListener('mousedown', handler)
  if (typeof window !== 'undefined') {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--sat').trim()
    const n = parseFloat(v)
    if (Number.isFinite(n)) safeTop.value = n
  }
})
onUnmounted(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', handler)
  if (focusTid) { clearTimeout(focusTid); focusTid = null }
})

watch(searchExpanded, (v) => {
  if (focusTid) { clearTimeout(focusTid); focusTid = null }
  if (!v) return
  focusTid = setTimeout(async () => {
    focusTid = null
    await nextTick()
    // Guard: el usuario pudo haber colapsado la búsqueda durante los 80ms.
    if (searchExpanded.value) searchInputRef.value?.focus?.()
  }, 80)
})

// Lista de branches que se muestran en el picker — solo ACTIVE. Las archivadas viven en
// SucursalesView como "carpeta especial", no en el picker (cutover doc § 4.1).
const pickerBranches = computed(() => branchesStore.active)
const activeBranch = computed(() => branchesStore.activeBranch)
const merchantName = computed(() => sessionStore.merchant?.businessName ?? '')
// Display text del pill. Backend devuelve `code` opcional — lo preferimos sobre
// la inicial del name porque es lo que el merchant configura como "código operativo".
const branchPillLabel = computed(() => {
  const b = activeBranch.value
  if (!b) return '—'
  return b.code || b.name.charAt(0).toUpperCase()
})
const activeBranchName = computed(() => activeBranch.value?.name ?? t('branches.notFound'))

const pickBranch = (id) => {
  branchesStore.setActive(id)
  menuOpen.value = false
  branchSheetOpen.value = false
}

const headerClass = computed(() => {
  const useBlur = perfStore.useBlur
  const isLite = perfStore.isLite
  const bgDark = useBlur ? 'bg-[#111113]/20' : 'bg-[#1A1A1D]'
  const bgLight = useBlur ? 'bg-white/30' : 'bg-white'
  const blur = useBlur ? ' backdrop-blur-2xl' : ''
  const borderDark = isLite ? 'border-[#7C3AED]/20' : 'border-white/10'
  const borderLight = isLite ? 'border-[#DBD3FB]' : 'border-white/80'
  const base = props.isDesktop
    ? 'h-20 relative'
    : 'h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] fixed inset-x-0 top-0'
  return [
    'z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 transition-colors duration-300',
    base,
    themeStore.isDarkMode
      ? `${bgDark}${blur} border-b ${borderDark}`
      : `${bgLight}${blur} border-b ${borderLight}`,
  ]
})

// Lite — halo sutil top-right del header (eco del halo en sidebar, balancea composición).
const liteHeaderHaloStyle = computed(() => {
  if (!perfStore.isLite) return null
  return themeStore.isDarkMode
    ? { background: 'radial-gradient(ellipse 60% 180% at 95% 50%, rgba(124,58,237,0.10), transparent 60%)' }
    : { background: 'radial-gradient(ellipse 60% 180% at 95% 50%, rgba(124,58,237,0.06), transparent 60%)' }
})

const desktopSearchClass = computed(() => {
  const neon = perfStore.useNeon
  const isLite = perfStore.isLite
  if (themeStore.isDarkMode) {
    if (isLite) return 'bg-[#0F0F11] border-white/15 focus-within:border-[#7C3AED]/60 focus-within:ring-2 focus-within:ring-[#7C3AED]/20'
    return `bg-[#252429]/30 backdrop-blur-xl border-white/10 border-t-white/20 focus-within:border-[#7C3AED]/60 focus-within:bg-[#252429]/50${neon ? ' focus-within:shadow-[0_0_20px_rgba(124,58,237,0.2)]' : ''}`
  }
  if (isLite) return 'bg-[#F8F7FB] border-[#DBD3FB] focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15'
  return `bg-white/50 backdrop-blur-xl border-white focus-within:border-[#7C3AED]/40 focus-within:bg-white/80 shadow-[0_4px_15px_rgb(0,0,0,0.02)]${neon ? ' focus-within:shadow-[0_0_20px_rgba(124,58,237,0.15)]' : ''}`
})

const inputTextClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#D8D7D9] placeholder:text-[#888991]'
    : 'text-[#111113] placeholder:text-[#B0AFB4]',
)

const branchPillClass = computed(() => {
  const neon = perfStore.useNeon
  const isLite = perfStore.isLite
  if (themeStore.isDarkMode) {
    if (isLite) return 'bg-[#1A1A1D] border border-[#7C3AED]/40 text-[#7C3AED]'
    return `bg-[#7C3AED]/15 backdrop-blur-xl border border-[#7C3AED]/40 text-[#7C3AED]${neon ? ' shadow-[0_0_15px_rgba(124,58,237,0.2)]' : ''}`
  }
  if (isLite) return 'bg-[#F8F7FB] border border-[#DBD3FB] shadow-sm text-[#7C3AED]'
  return 'bg-white/90 border border-white shadow-md text-[#7C3AED] backdrop-blur-xl'
})

const mobileSearchBarClass = computed(() => {
  const neon = perfStore.useNeon
  const isLite = perfStore.isLite
  if (themeStore.isDarkMode) {
    if (isLite) return 'bg-[#0F0F11] border-[#7C3AED]/40'
    return `bg-[#252429]/50 backdrop-blur-xl border-[#7C3AED]/40${neon ? ' shadow-[0_0_15px_rgba(124,58,237,0.15)]' : ''}`
  }
  if (isLite) return 'bg-[#F8F7FB] border-[#DBD3FB]'
  return `bg-white/70 backdrop-blur-xl border-[#7C3AED]/30${neon ? ' shadow-[0_0_15px_rgba(124,58,237,0.1)]' : ''}`
})

const optionClass = (selected) => {
  if (selected) return themeStore.isDarkMode ? 'text-white' : 'text-[#561BAF]'
  return themeStore.isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
}

const sheetOptionClass = (selected) => {
  if (selected) return themeStore.isDarkMode ? 'text-white' : 'text-[#561BAF]'
  return themeStore.isDarkMode ? 'text-[#888991] active:bg-white/5' : 'text-[#67656E] active:bg-black/5'
}

const pillBg = computed(() =>
  themeStore.isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50',
)

const sheetPillBg = computed(() =>
  themeStore.isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/40',
)

// Subtle separator + label class for the merchant name shown above the branch list.
const merchantLabelClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991] border-white/10' : 'text-[#67656E] border-black/5',
)

const goSettings = () => navigateTo(ROUTES.SETTINGS)
</script>

<template>
  <motion.header
    :animate="{ y: !isDesktop && !headerVisible ? -(64 + safeTop) : 0 }"
    :transition="SPRING_SIDEBAR"
    :class="headerClass"
  >
    <!-- Lite: halo sutil top-right — eco del halo en sidebar, da "atmósfera" brand sin blur. -->
    <div
      v-if="perfStore.isLite"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-[-1]"
      :style="liteHeaderHaloStyle"
    />

    <!-- Desktop -->
    <template v-if="isDesktop">
      <div :class="['flex items-center px-4 py-2.5 rounded-xl border w-[240px] md:w-[300px] lg:w-[340px] xl:w-[400px] transition-[border-color,box-shadow] duration-300', desktopSearchClass]">
        <Search :size="16" :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'" />
        <input
          type="text"
          :placeholder="viewSearch.placeholder || t('header.searchPlaceholder')"
          :value="viewSearch.query"
          :class="['bg-transparent border-none outline-hidden text-sm ml-3 w-full font-medium placeholder:opacity-60', inputTextClass]"
          @input="viewSearch.setQuery($event.target.value)"
        />
        <button
          v-if="viewSearch.query"
          :class="['ml-1 p-0.5 rounded-md transition-colors', themeStore.isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]']"
          @click="viewSearch.setQuery('')"
        >
          <span class="text-xs font-bold">✕</span>
        </button>
      </div>

      <div class="flex items-center gap-4">
        <Tooltip :content="t('header.themeToggle')" position="bottom">
          <Button :aria-label="t('header.themeToggle')" variant="ghost" size="icon" @click="themeStore.toggleTheme()">
            <component :is="themeStore.isDarkMode ? Sun : Moon" :size="20" />
          </Button>
        </Tooltip>

        <Tooltip :content="t('header.settings')" position="bottom">
          <Button :aria-label="t('header.settings')" variant="ghost" size="icon" @click="goSettings">
            <Settings :size="20" />
          </Button>
        </Tooltip>

        <Tooltip :content="t('header.notifications')" position="bottom">
          <Button :aria-label="t('header.notifications')" variant="ghost" size="icon" class="relative">
            <motion.span
              :while-hover="perfStore.useContinuousAnim ? { rotate: [0, -18, 14, -10, 6, 0] } : undefined"
              :transition="{ duration: 0.6, ease: 'easeInOut' }"
              class="flex items-center justify-center"
            >
              <Bell :size="20" />
            </motion.span>
            <span :class="[
              'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-[2px]',
              themeStore.isDarkMode
                ? `bg-[#7C3AED] border-[#111113]${perfStore.useNeon ? ' shadow-[0_0_10px_rgba(124,58,237,0.9)]' : ''}`
                : `bg-red-500 border-white${perfStore.useNeon ? ' shadow-[0_0_10px_rgba(239,68,68,0.6)]' : ''}`
            ]" />
          </Button>
        </Tooltip>

        <!-- Desktop branch picker -->
        <div ref="menuRef" class="relative">
          <button
            aria-haspopup="listbox"
            :aria-expanded="menuOpen"
            :disabled="!activeBranch"
            :class="['flex items-center gap-3 cursor-pointer pl-6 border-l h-10 transition-colors select-none disabled:opacity-50 disabled:cursor-default', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']"
            @click="activeBranch && (menuOpen = !menuOpen)"
            @keydown.escape="menuOpen = false"
          >
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold', branchPillClass]">
              {{ branchPillLabel }}
            </div>
            <span :class="['text-sm font-semibold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
              {{ activeBranchName }}
            </span>
            <motion.span
              v-if="activeBranch"
              :animate="{ rotate: menuOpen ? 180 : 0 }"
              :transition="SPRING"
              :class="['flex items-center', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']"
            >
              <ChevronDown :size="14" />
            </motion.span>
          </button>

          <AnimatePresence>
            <motion.div
              v-if="menuOpen"
              role="listbox"
              :aria-label="t('nav.branches')"
              :variants="panelVariants"
              initial="hidden"
              animate="visible"
              exit="exit"
              :style="{ transformOrigin: 'top right' }"
              :class="['absolute right-0 mt-4 w-64 rounded-2xl z-50 overflow-hidden', getDropdownGlass(themeStore.isDarkMode, perfStore.useBlur, perfStore.modalShadow, perfStore.useGlassElevation)]"
            >
              <!-- Merchant header — label estático no clickeable. Cutover doc § 4.1: el negocio
                   no se cambia desde acá; solo se muestra para que el user sepa en qué hotel está. -->
              <div
                v-if="merchantName"
                :class="['px-5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest border-b', merchantLabelClass]"
              >
                {{ merchantName }}
              </div>
              <div class="p-2 flex flex-col gap-0.5">
                <button
                  v-for="branch in pickerBranches"
                  :key="branch.id"
                  role="option"
                  :aria-selected="activeBranch?.id === branch.id"
                  :class="['relative w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors duration-150', optionClass(activeBranch?.id === branch.id)]"
                  @click="pickBranch(branch.id)"
                >
                  <motion.div
                    v-if="activeBranch?.id === branch.id"
                    :layout-id="perfStore.useNavMorphs ? `branch-pill-${pillId}` : undefined"
                    :class="['absolute inset-0 rounded-xl', pillBg]"
                    :transition="SPRING"
                  />
                  <Building2 :size="16" :class="['relative z-10', activeBranch?.id === branch.id ? 'text-[#7C3AED]' : 'opacity-50']" />
                  <span class="relative z-10 truncate">{{ branch.name }}</span>
                  <span
                    v-if="branch.isPrimary"
                    :class="['relative z-10 ml-auto text-[9px] font-bold uppercase tracking-wider', activeBranch?.id === branch.id ? 'text-[#7C3AED]' : 'text-[#888991]']"
                  >
                    {{ t('branches.main') }}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </template>

    <!-- Mobile -->
    <template v-else>
      <div class="flex items-center flex-1 min-w-0 mr-3">
        <ZwapIsotipo wrapper-class="h-7 shrink-0" />
        <AnimatePresence :initial="false" mode="wait">
          <motion.div
            v-if="searchExpanded"
            key="search-bar"
            :initial="{ opacity: 0, filter: 'blur(4px)', x: -8 }"
            :animate="{ opacity: 1, filter: 'blur(0px)', x: 0 }"
            :exit="{ opacity: 0, filter: 'blur(4px)', x: -8 }"
            :transition="SPRING"
            :class="['flex-1 min-w-0 flex items-center gap-2 ml-2 px-3 py-2 rounded-xl border overflow-hidden', mobileSearchBarClass]"
          >
            <Search :size="16" class="text-[#7C3AED] shrink-0" />
            <input
              ref="searchInputRef"
              type="text"
              :value="viewSearch.query"
              :placeholder="viewSearch.placeholder || t('header.searchPlaceholder')"
              :class="['bg-transparent border-none outline-hidden text-sm w-full font-medium placeholder:opacity-50', inputTextClass]"
              @input="viewSearch.setQuery($event.target.value)"
            />
            <motion.button
              :while-tap="{ scale: 0.85 }"
              :transition="SPRING"
              :class="['p-1 rounded-lg shrink-0 transition-colors', themeStore.isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]']"
              @click="viewSearch.query ? viewSearch.setQuery('') : (searchExpanded = false)"
            >
              <X :size="16" />
            </motion.button>
          </motion.div>
          <motion.div
            v-else
            key="wordmark"
            :variants="WORDMARK_VARIANTS"
            initial="hidden"
            animate="show"
            exit="exit"
            class="-ml-[2.4px]"
          >
            <ZwapWordmark wrapper-class="h-[18px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <AnimatePresence>
          <motion.div
            v-if="!searchExpanded"
            key="search-icon"
            :initial="{ opacity: 0, x: 10 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 10 }"
            :transition="{ ...SPRING, stiffness: 500 }"
          >
            <Button :aria-label="t('header.search')" variant="ghost" size="icon" @click="searchExpanded = true">
              <Search :size="20" />
            </Button>
          </motion.div>
        </AnimatePresence>
        <!-- Filter button: visible aunque la búsqueda esté abierta. -->
        <Button
          v-if="viewSearch.hasFilters"
          :aria-label="t('filters.status')"
          variant="ghost"
          size="icon"
          class="relative"
          @click="viewSearch.openFilters()"
        >
          <SlidersHorizontal :size="19" />
          <span
            v-if="viewSearch.activeFilterCount > 0"
            :class="['absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C3AED]', perfStore.useNeon ? (themeStore.isDarkMode ? 'shadow-[0_0_8px_rgba(124,58,237,0.8)]' : 'shadow-[0_0_8px_rgba(124,58,237,0.6)]') : '']"
          />
        </Button>
        <button
          :aria-label="t('nav.branches')"
          :disabled="!activeBranch"
          :class="['w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors disabled:opacity-50', branchPillClass]"
          @click="activeBranch && (branchSheetOpen = true)"
        >
          {{ branchPillLabel }}
        </button>
      </div>
    </template>
  </motion.header>

  <!-- Mobile branch BottomSheet -->
  <BottomSheet :is-open="branchSheetOpen" :title="merchantName || t('nav.branches')" @close="branchSheetOpen = false">
    <div class="px-4 pb-6 flex flex-col gap-1">
      <button
        v-for="branch in pickerBranches"
        :key="branch.id"
        :class="['relative w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium flex items-center gap-3 transition-colors', sheetOptionClass(activeBranch?.id === branch.id)]"
        @click="pickBranch(branch.id)"
      >
        <motion.div
          v-if="activeBranch?.id === branch.id"
          :layout-id="perfStore.useNavMorphs ? 'branch-sheet-pill' : undefined"
          :class="['absolute inset-0 rounded-xl', sheetPillBg]"
          :transition="SPRING"
        />
        <Building2 :size="18" :class="['relative z-10', activeBranch?.id === branch.id ? 'text-[#7C3AED]' : 'opacity-50']" />
        <span class="relative z-10 flex-1 truncate">{{ branch.name }}</span>
        <span
          v-if="branch.isPrimary"
          :class="['relative z-10 text-[10px] font-bold uppercase tracking-wider', activeBranch?.id === branch.id ? 'text-[#7C3AED]' : 'text-[#888991]']"
        >
          {{ t('branches.main') }}
        </span>
        <Check v-if="activeBranch?.id === branch.id" :size="18" class="relative z-10 text-[#7C3AED]" />
      </button>
    </div>
  </BottomSheet>
</template>
