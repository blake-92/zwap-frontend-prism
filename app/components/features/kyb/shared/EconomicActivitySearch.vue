<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Search, X, Loader2 } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useDebouncedSearch } from '~/composables/useDebouncedSearch'
import { useKybApi } from '~/composables/kyb/useKybApi'
import { getDropdownGlass } from '~/utils/cardClasses'
import { SPRING } from '~/utils/springs'

const props = defineProps({
  // Selección actual: { code, description } | null.
  modelValue: { type: Object, default: null },
  // Jurisdicción del entity — el backend filtra el catálogo CAEB (BO) / NAICS (US).
  jurisdiction: { type: String, required: true },
  // Forwarded a los inputs como aria-describedby si la form quiere mostrar error inline.
  describedby: { type: String, default: null },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const themeStore = useThemeStore()
const api = useKybApi()

const inputText = ref(props.modelValue?.description ?? '')
const debounced = useDebouncedSearch(() => inputText.value, { liteDelay: 250 })

const results = ref([])
const loading = ref(false)
const open = ref(false)
const activeIndex = ref(-1)
const rootRef = ref(null)
const inputRef = ref(null)
const listboxId = `kyb-activity-listbox-${Math.random().toString(36).slice(2, 8)}`

// Si el padre hidrata modelValue después del mount (recovery del draft), refleja en el input.
watch(() => props.modelValue, (val) => {
  inputText.value = val?.description ?? ''
})

// Fetch on debounced change. < 2 chars → no consultamos (rate-limit + ruido).
let lastQuery = ''
watch(debounced, async (q) => {
  const trimmed = (q ?? '').trim()
  if (trimmed === lastQuery) return
  lastQuery = trimmed
  if (trimmed.length < 2) {
    results.value = []
    open.value = false
    return
  }
  loading.value = true
  try {
    const r = await api.searchEconomicActivities({ jurisdiction: props.jurisdiction, q: trimmed })
    results.value = Array.isArray(r) ? r : []
    activeIndex.value = results.value.length > 0 ? 0 : -1
    open.value = results.value.length > 0
  } catch {
    // Silencio — el catálogo es nice-to-have. El user puede dejar el campo vacío
    // (es opcional en el OpenAPI). El parent form maneja errores fatales.
    results.value = []
    open.value = false
  } finally {
    loading.value = false
  }
})

function pick(item) {
  inputText.value = item.description
  results.value = []
  open.value = false
  activeIndex.value = -1
  emit('update:modelValue', { code: item.code, description: item.description })
  // Volver el foco al input para que el user pueda seguir editando si quiso solo previsualizar.
  nextTick(() => inputRef.value?.focus?.())
}

function clear() {
  inputText.value = ''
  results.value = []
  open.value = false
  activeIndex.value = -1
  emit('update:modelValue', null)
  inputRef.value?.focus?.()
}

function onFocus() {
  if (results.value.length > 0) open.value = true
}

function onKeydown(e) {
  if (!open.value || results.value.length === 0) {
    if (e.key === 'ArrowDown' && results.value.length > 0) {
      open.value = true
      activeIndex.value = 0
      e.preventDefault()
    }
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = activeIndex.value <= 0 ? results.value.length - 1 : activeIndex.value - 1
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeIndex.value >= 0) pick(results.value[activeIndex.value])
  } else if (e.key === 'Escape') {
    e.preventDefault()
    open.value = false
  }
}

// Cerrar al click fuera.
function onDocumentClick(e) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(e.target)) open.value = false
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('mousedown', onDocumentClick)
  }
})
onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', onDocumentClick)
  }
})

const dropdownClass = computed(() => getDropdownGlass(themeStore.isDarkMode))
const inputBaseClass = computed(() => themeStore.isDarkMode
  ? 'bg-[#111113]/40 text-white placeholder-[#888991] border-white/10 focus:border-[#7C3AED]/60'
  : 'bg-white/60 text-[#111113] placeholder-[#67656E] border-white focus:border-[#7C3AED]/60')

const activeOptionId = computed(() => activeIndex.value >= 0 ? `${listboxId}-opt-${activeIndex.value}` : undefined)
</script>

<template>
  <div ref="rootRef" class="relative">
    <div
      role="combobox"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="activeOptionId"
      aria-haspopup="listbox"
      class="relative"
    >
      <Search
        :size="16"
        :class="[
          'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
          themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
        ]"
      />
      <input
        ref="inputRef"
        v-model="inputText"
        type="text"
        autocomplete="off"
        :placeholder="$t('kyb.step2.economicActivityPlaceholder')"
        :aria-invalid="invalid"
        :aria-describedby="describedby ?? undefined"
        :disabled="disabled"
        :class="[
          'w-full rounded-xl border pl-10 pr-10 py-3 text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30',
          inputBaseClass,
          invalid ? '!border-rose-500/60' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @keydown="onKeydown"
        @focus="onFocus"
      >
      <button
        v-if="modelValue || inputText"
        type="button"
        :aria-label="$t('common.close')"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
        @click="clear"
      >
        <X :size="14" :class="themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'" />
      </button>
      <Loader2
        v-if="loading"
        :size="14"
        :class="[
          'absolute right-9 top-1/2 -translate-y-1/2 animate-spin',
          themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
        ]"
      />
    </div>

    <AnimatePresence>
      <motion.ul
        v-if="open && results.length > 0"
        :id="listboxId"
        role="listbox"
        :class="[
          'absolute z-30 left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl py-1',
          dropdownClass,
        ]"
        :initial="{ opacity: 0, y: -4 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -4 }"
        :transition="SPRING"
      >
        <li
          v-for="(item, i) in results"
          :id="`${listboxId}-opt-${i}`"
          :key="item.code"
          role="option"
          :aria-selected="i === activeIndex"
          :class="[
            'px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-baseline gap-3',
            i === activeIndex
              ? (themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-white' : 'bg-[#DBD3FB]/40 text-[#561BAF]')
              : (themeStore.isDarkMode ? 'text-[#D8D7D9] hover:bg-white/5' : 'text-[#111113] hover:bg-black/5'),
          ]"
          @mousedown.prevent="pick(item)"
          @mouseenter="activeIndex = i"
        >
          <span :class="['font-mono text-[11px] shrink-0', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ item.code }}
          </span>
          <span class="font-medium">{{ item.description }}</span>
        </li>
      </motion.ul>
    </AnimatePresence>
  </div>
</template>
