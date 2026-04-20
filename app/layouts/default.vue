<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { motion } from 'motion-v'
import { ChevronRight } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useModalOpen } from '~/composables/useModalOpen'
import { BRANCHES } from '~/utils/mockData'
import { SPRING } from '~/utils/springs'
import Sidebar from '~/components/Sidebar.vue'
import Header from '~/components/Header.vue'
import BottomNav from '~/components/BottomNav.vue'
import GlassBackground from '~/components/GlassBackground.vue'
import ToastContainer from '~/components/ToastContainer.vue'

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const modalOpen = useModalOpen()
const branch = ref(BRANCHES[0])

// Hidratar sincrónicamente para evitar flicker 256px → 72px en mount.
const readSidebarCollapsed = () => {
  if (typeof localStorage === 'undefined') return false
  try { return localStorage.getItem('zwap-sidebar') === 'collapsed' } catch { return false }
}
const isCollapsed = ref(readSidebarCollapsed())
const mainRef = ref(null)
let lastScrollY = 0
let quietTid = null
const headerVisible = ref(true)

// Scroll-aware mobile header
const onScroll = () => {
  if (!mainRef.value) return
  // iOS rubber-band puede reportar scrollTop negativo; clamp a 0 para que
  // el delta no se invierta al volver de un overscroll.
  const y = Math.max(0, mainRef.value.scrollTop)
  const delta = y - lastScrollY
  if (y <= 4) headerVisible.value = true
  else if (delta > 8) headerVisible.value = false
  else if (delta < -8) headerVisible.value = true
  lastScrollY = y
  if (quietTid) clearTimeout(quietTid)
  // Si el usuario se detiene cerca del top sin seguir scrolleando, garantiza
  // header visible (evita quedar "atascado" oculto por el último delta).
  quietTid = setTimeout(() => { if (y < 120) headerVisible.value = true }, 600)
}

// iOS Safari colapsa/expande el URL bar con gestos del sistema; el scroll
// real en mainRef no cambia pero visualViewport sí. Al detectar ese resize
// reseteamos headerVisible para que siempre quede sincronizado con el chrome.
const onViewportResize = () => { headerVisible.value = true }

let scrollListenerAttached = false
const attachScroll = () => {
  if (scrollListenerAttached || !mainRef.value) return
  mainRef.value.addEventListener('scroll', onScroll, { passive: true })
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportResize)
  }
  scrollListenerAttached = true
}
const detachScroll = () => {
  if (!scrollListenerAttached || !mainRef.value) return
  mainRef.value.removeEventListener('scroll', onScroll)
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.removeEventListener('resize', onViewportResize)
  }
  if (quietTid) { clearTimeout(quietTid); quietTid = null }
  scrollListenerAttached = false
}

watch(isDesktop, (d) => {
  if (d) { headerVisible.value = true; detachScroll() }
  else attachScroll()
})

onMounted(() => {
  if (typeof document === 'undefined') return
  // Main es el contenedor de scroll — bloquear document/body scroll.
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  if (!isDesktop.value) attachScroll()
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
  detachScroll()
})

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem('zwap-sidebar', isCollapsed.value ? 'collapsed' : 'expanded') } catch {}
}

const mainPaddingStyle = computed(() =>
  !isDesktop.value ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' } : undefined,
)

const mainClass = computed(() => [
  'flex-1 overflow-auto overscroll-y-contain',
  isDesktop.value
    ? 'px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 lg:pb-10 xl:pb-12 2xl:pb-16'
    : 'px-4 sm:px-6 pt-[calc(5rem+env(safe-area-inset-top))]',
])

// Modal backdrop aplica el blur — aquí solo desaturate + pointer-events-none para "receded" sin doble blur.
const sidebarWrapperClass = computed(() => [
  'relative shrink-0 group/sidebar transition-[filter,opacity] duration-150',
  modalOpen.value ? 'saturate-50 pointer-events-none' : '',
])

const toggleBtnClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429] backdrop-blur-md border-white/20 text-[#888991] hover:text-white hover:border-[#7C3AED]/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
    : 'bg-white backdrop-blur-md border-black/10 text-[#67656E] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
)
</script>

<template>
  <div :class="['min-h-dvh flex font-sans transition-colors duration-300 relative overflow-hidden', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
    <GlassBackground />

    <!-- Desktop sidebar + toggle -->
    <div v-if="isDesktop" :class="sidebarWrapperClass">
      <Sidebar :is-collapsed="isCollapsed" />

      <!-- Lite: rim brand-tinted con gradient top→decay. Hover no aplica aquí (inline bg domina utility). -->
      <div
        v-if="perfStore.isLite"
        aria-hidden="true"
        class="absolute inset-y-0 right-0 w-px"
        :style="{
          background: themeStore.isDarkMode
            ? 'linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.5) 10%, rgba(124,58,237,0.2) 55%, rgba(255,255,255,0.08) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.35) 10%, rgba(124,58,237,0.12) 55%, rgba(0,0,0,0.05) 100%)',
        }"
      />
      <div v-else :class="['absolute inset-y-0 right-0 w-px transition-colors duration-300 group-hover/sidebar:bg-[#7C3AED]/40', themeStore.isDarkMode ? 'bg-white/10' : 'bg-black/5']" />

      <motion.div
        class="absolute z-30"
        :style="{ top: '50%', translateY: '-50%' }"
        :animate="{ left: isCollapsed ? 60 : 244 }"
        :transition="SPRING"
      >
        <motion.button
          :while-hover="{ scale: 1.15 }"
          :while-tap="{ scale: 0.9 }"
          :transition="SPRING"
          :title="isCollapsed ? 'Expandir menu' : 'Colapsar menu'"
          :class="['w-6 h-6 rounded-full flex items-center justify-center border shadow-lg', toggleBtnClass]"
          @click="toggle"
        >
          <motion.span
            :animate="{ rotate: isCollapsed ? 0 : 180 }"
            :transition="SPRING"
            class="flex items-center justify-center"
          >
            <ChevronRight :size="12" />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>

    <!-- Main -->
    <div class="flex-1 flex flex-col h-dvh overflow-hidden z-10 relative">
      <Header
        :selected-branch="branch"
        :is-desktop="isDesktop"
        :header-visible="headerVisible"
        @branch-change="branch = $event"
      />

      <main
        ref="mainRef"
        :class="mainClass"
        :style="mainPaddingStyle"
      >
        <div class="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <BottomNav v-if="!isDesktop" />

    <ToastContainer />
  </div>
</template>
