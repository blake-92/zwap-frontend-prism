<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { motion } from 'motion-v'
import { ChevronRight } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
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
const isDesktop = useMediaQuery('(min-width: 1024px)')
const modalOpen = useModalOpen()
const branch = ref(BRANCHES[0])

// Hidratar sincrónicamente para evitar flicker 256px → 72px.
const isCollapsed = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem('zwap-sidebar') === 'collapsed',
)
const mainRef = ref(null)
let lastScrollY = 0
const headerVisible = ref(true)

onMounted(() => {
  if (typeof document === 'undefined') return
  // Prevent document scroll — main is scroll container
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})

// Scroll-aware mobile header
const onScroll = () => {
  if (!mainRef.value) return
  const y = mainRef.value.scrollTop
  const delta = y - lastScrollY
  if (y <= 4) headerVisible.value = true
  else if (delta > 8) headerVisible.value = false
  else if (delta < -8) headerVisible.value = true
  lastScrollY = Math.max(0, y)
}

watch(isDesktop, (d) => {
  if (!mainRef.value) return
  if (d) {
    headerVisible.value = true
    mainRef.value.removeEventListener('scroll', onScroll)
  } else {
    mainRef.value.addEventListener('scroll', onScroll, { passive: true })
  }
}, { immediate: false })

onMounted(() => {
  if (!isDesktop.value && mainRef.value) {
    mainRef.value.addEventListener('scroll', onScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (mainRef.value) mainRef.value.removeEventListener('scroll', onScroll)
})

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('zwap-sidebar', isCollapsed.value ? 'collapsed' : 'expanded')
  }
}

const mainPaddingStyle = computed(() =>
  !isDesktop.value ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' } : undefined,
)

const mainClass = computed(() => [
  'flex-1 overflow-auto overscroll-y-contain',
  isDesktop.value
    ? 'px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 xl:pt-10 2xl:px-12 2xl:pt-12 lg:pb-10 xl:pb-12 2xl:pb-16'
    : 'px-4 sm:px-6 pt-20',
])

// El blur del chrome cuando hay modal abierto lo hace el `backdrop-blur-md`
// del backdrop del modal (cubre z-40/z-20 desde z-50). Aquí solo desaturamos
// + bloqueamos clicks para feel "receded" sin doble blur.
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
  <div :class="['min-h-screen flex font-sans transition-colors duration-300 relative overflow-hidden', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
    <GlassBackground />

    <!-- Desktop sidebar + toggle -->
    <div v-if="isDesktop" :class="sidebarWrapperClass">
      <Sidebar :is-collapsed="isCollapsed" />

      <div :class="['absolute inset-y-0 right-0 w-px transition-colors duration-300 group-hover/sidebar:bg-[#7C3AED]/40', themeStore.isDarkMode ? 'bg-white/10' : 'bg-black/5']" />

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
    <div class="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
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
