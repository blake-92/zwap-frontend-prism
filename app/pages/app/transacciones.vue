<script setup>
import TransaccionesView from '~/components/features/transactions/TransaccionesView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <TransaccionesView />
</template>
