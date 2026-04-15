<script setup>
import LinksView from '~/components/features/links/LinksView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <LinksView />
</template>
