<script setup>
definePageMeta({ layout: false })
const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-xl text-center">
      <h1 class="text-2xl font-bold mb-4">{{ route.params.doc }}</h1>
      <p class="opacity-60">Próximamente.</p>
    </div>
  </div>
</template>
