<script setup>
definePageMeta({ layout: false })
const route = useRoute()

// Whitelist — evita que una URL /legal/<arbitrary> renderice el param crudo como título.
const LEGAL_DOCS = {
  terminos: 'Términos y Condiciones',
  privacidad: 'Aviso de Privacidad',
}
const doc = computed(() => route.params.doc)
const title = computed(() => LEGAL_DOCS[doc.value])
if (import.meta.client && !title.value) navigateTo('/login', { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-xl text-center">
      <h1 v-if="title" class="text-2xl font-bold mb-4">{{ title }}</h1>
      <p class="opacity-60">Próximamente.</p>
    </div>
  </div>
</template>
