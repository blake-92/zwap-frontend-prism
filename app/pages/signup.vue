<script setup>
import { ROUTES } from '~/utils/routes'
// Entry-point público — redirige al wizard. Mantiene `/signup` como URL canónica que se puede
// linkear desde marketing / footers / etc., sin atar a la implementación interna del wizard.
definePageMeta({ layout: false })
await navigateTo(ROUTES.ONBOARDING_START, { replace: true })
</script>
<template><div /></template>
