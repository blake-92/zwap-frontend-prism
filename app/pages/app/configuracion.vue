<script setup>
import SettingsView from '~/components/features/settings/SettingsView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <SettingsView />
</template>
