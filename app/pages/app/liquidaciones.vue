<script setup>
import LiquidacionesView from '~/components/features/settlements/LiquidacionesView.vue'
definePageMeta({ middleware: 'auth', requiresPermission: 'SETTLEMENTS_VIEW' })
</script>

<template>
  <LiquidacionesView />
</template>
