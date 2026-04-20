<script setup>
import { AlertCircle } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div
    :class="[
      'max-w-[860px] mx-auto my-4 px-5 py-3 rounded-xl border flex items-start gap-3 text-xs font-medium leading-relaxed',
      themeStore.isDarkMode
        ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
        : 'bg-amber-50 border-amber-200 text-amber-800',
    ]"
  >
    <AlertCircle :size="16" class="mt-0.5 shrink-0" />
    <p>
      <strong>Unofficial English translation.</strong>
      The Spanish version of this document is the authoritative legal text.
      In case of any discrepancy, the Spanish version prevails.
    </p>
  </div>
</template>
