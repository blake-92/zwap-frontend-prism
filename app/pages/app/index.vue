<script setup>
definePageMeta({
  middleware: ['auth', () => navigateTo('/app/dashboard', { replace: true })],
})
</script>

<template>
  <div />
</template>
