<script setup>
import SucursalesView from '~/components/features/branches/SucursalesView.vue'
// BRANCHES_MANAGE (OWNER/ADMIN) gating de la página de gestión. ACCOUNTANT/RECEPTIONIST
// tienen BRANCHES_VIEW solo para poblar el selector de sucursal del navbar — no entran acá.
definePageMeta({ middleware: 'auth', requiresPermission: 'BRANCHES_MANAGE' })
</script>

<template>
  <SucursalesView />
</template>
