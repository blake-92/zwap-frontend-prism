<script setup>
import { computed, ref } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  icon: { type: [Object, Function], default: null },
  prefix: { type: String, default: '' },
  error: { type: Boolean, default: false },
  modelValue: { type: [String, Number], default: undefined },
})

const emit = defineEmits(['update:modelValue'])

defineOptions({ inheritAttrs: false })

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const el = ref(null)

defineExpose({ el })

const inputClass = computed(() => {
  const d = themeStore.isDarkMode
  // En Lite no hay glass, necesitamos bg distinto del Card (paper) para que input sea visible.
  const isLite = perfStore.isLite

  if (props.error) {
    return d
      ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)] placeholder-[#888991]'
      : 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
  }

  if (isLite) {
    // Lite — bg layered distinto del card + borde lavanda + focus con ring branded
    return d
      ? 'bg-[#0F0F11] border-white/15 text-white focus:border-[#7C3AED]/60 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder-[#888991]'
      : 'bg-[#F8F7FB] border-[#DBD3FB] text-[#111113] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder-[#A29CB8]'
  }

  // Prism/Normal — glass (transparency suficiente para distinguir del card)
  return d
    ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] placeholder-[#888991]'
    : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-xs placeholder-[#B0AFB4]'
})
</script>

<template>
  <div class="relative">
    <component
      :is="icon"
      v-if="icon"
      :size="18"
      aria-hidden="true"
      :class="['absolute left-4 top-3.5 pointer-events-none', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]']"
    />
    <span
      v-if="prefix && !icon"
      aria-hidden="true"
      :class="['absolute left-4 top-3.5 font-bold text-lg pointer-events-none', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']"
    >
      {{ prefix }}
    </span>
    <input
      ref="el"
      v-bind="$attrs"
      :value="modelValue"
      :class="[
        'w-full py-3 rounded-xl border outline-hidden transition-colors font-medium',
        icon ? 'pl-11 pr-4' : prefix ? 'pl-8 pr-4' : 'px-4',
        inputClass,
      ]"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
