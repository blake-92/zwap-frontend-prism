<script setup>
import DashboardView from '~/components/features/dashboard/DashboardView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <DashboardView />
</template>
