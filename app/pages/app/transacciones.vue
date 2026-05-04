<script setup>
import TransaccionesView from '~/components/features/transactions/TransaccionesView.vue'
definePageMeta({ middleware: 'auth', requiresPermission: 'TRANSACTIONS_VIEW' })
</script>

<template>
  <TransaccionesView />
</template>
