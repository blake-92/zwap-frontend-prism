<script setup>
import SucursalesView from '~/components/features/branches/SucursalesView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <SucursalesView />
</template>
