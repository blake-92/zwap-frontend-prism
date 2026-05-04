<script setup>
import WalletView from '~/components/features/wallet/WalletView.vue'
definePageMeta({ middleware: 'auth', requiresPermission: 'WALLET_VIEW' })
</script>

<template>
  <WalletView />
</template>
