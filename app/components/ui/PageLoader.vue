<script setup>
import { usePerformanceStore } from '~/stores/performance'

const perfStore = usePerformanceStore()
</script>

<template>
  <div class="flex items-center justify-center h-full min-h-[50vh]">
    <div
      v-if="perfStore.useContinuousAnim"
      class="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin"
    />
    <div
      v-else
      class="w-8 h-8 border-2 border-[#7C3AED]/60 rounded-full"
    />
  </div>
</template>
