<script setup>
import { computed } from 'vue'
import Terms from '~/components/features/legal/docs/Terms.vue'
import Privacy from '~/components/features/legal/docs/Privacy.vue'
import Copyright from '~/components/features/legal/docs/Copyright.vue'

definePageMeta({ layout: false })

const route = useRoute()

// Whitelist — evita que una URL /legal/<arbitrary> renderice componentes arbitrarios.
const LEGAL_DOCS = {
  terminos: Terms,
  privacidad: Privacy,
  copyright: Copyright,
}

const doc = computed(() => route.params.doc)
const Component = computed(() => LEGAL_DOCS[doc.value])

if (import.meta.client && !Component.value) navigateTo('/login', { replace: true })
</script>

<template>
  <component :is="Component" v-if="Component" />
</template>
