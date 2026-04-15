<script setup>
const { t } = useI18n()
const errorRef = ref(null)
</script>

<template>
  <NuxtErrorBoundary @error="(err) => (errorRef = err)">
    <slot />
    <template #error="{ error, clearError }">
      <div class="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <p class="text-lg font-medium">{{ t('errors.somethingWrong') }}</p>
        <button
          class="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#561BAF] transition-colors"
          @click="clearError"
        >
          {{ t('errors.retry') }}
        </button>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>
