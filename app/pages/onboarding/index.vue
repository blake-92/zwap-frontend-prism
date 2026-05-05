<script setup>
import { ROUTES } from '~/utils/routes'
// /onboarding sin sub-path → mandar a /onboarding/start. Mantiene el patrón de /app/index.vue.
definePageMeta({ layout: false })
await navigateTo(ROUTES.ONBOARDING_START, { replace: true })
</script>
<template><div /></template>
