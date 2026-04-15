<script setup>
import WalletView from '~/components/features/wallet/WalletView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <WalletView />
</template>
