<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { motion, LayoutGroup } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { getDropdownGlass } from '~/utils/cardClasses'
import { SPRING_SOFT } from '~/utils/springs'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    // [{ id: 'general', label: 'General' }, ...]
  },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const activeId = ref(props.items[0]?.id ?? '')
const observer = ref(null)

const barClasses = computed(() =>
  getDropdownGlass(
    themeStore.isDarkMode,
    perfStore.useBlur,
    'medium',
    perfStore.useGlassElevation,
  ),
)

const linkBaseClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
const linkActiveClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
)

const handleClick = (e, id) => {
  e.preventDefault()
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  // Offset for the sticky toc itself (~56px) plus small margin.
  const y = el.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top: y, behavior: perfStore.isLite ? 'auto' : 'smooth' })
  activeId.value = id
}

onMounted(async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  const sections = props.items
    .map((item) => document.getElementById(item.id))
    .filter(Boolean)
  if (!sections.length) return

  observer.value = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-20% 0px -72% 0px' },
  )
  sections.forEach((s) => observer.value.observe(s))
})

onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect()
})
</script>

<template>
  <nav
    data-legal-toc
    :class="[
      'sticky top-0 z-30 border-b',
      barClasses,
    ]"
  >
    <div class="max-w-[860px] mx-auto px-5 sm:px-8">
      <div class="overflow-x-auto no-scrollbar">
        <LayoutGroup id="legal-toc">
          <ul class="flex items-end gap-0 whitespace-nowrap list-none m-0 p-0">
            <li v-for="item in items" :key="item.id" class="relative">
              <a
                :href="`#${item.id}`"
                :class="[
                  'relative inline-block px-3.5 py-3 text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-200',
                  activeId === item.id ? linkActiveClass : linkBaseClass,
                  themeStore.isDarkMode ? 'hover:text-[#A78BFA]' : 'hover:text-[#7C3AED]',
                ]"
                @click="handleClick($event, item.id)"
              >
                {{ item.label }}
                <motion.span
                  v-if="activeId === item.id && perfStore.useNavMorphs"
                  layout-id="legal-toc-underline"
                  class="absolute left-3 right-3 bottom-0 h-0.5 bg-[#7C3AED] rounded-full"
                  :transition="SPRING_SOFT"
                />
                <span
                  v-else-if="activeId === item.id"
                  class="absolute left-3 right-3 bottom-0 h-0.5 bg-[#7C3AED] rounded-full"
                />
              </a>
            </li>
          </ul>
        </LayoutGroup>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
