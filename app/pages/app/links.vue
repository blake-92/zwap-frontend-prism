<script setup>
import LinksView from '~/components/features/links/LinksView.vue'
definePageMeta({ middleware: 'auth', requiresPermission: 'LINKS_VIEW' })
</script>

<template>
  <LinksView />
</template>
