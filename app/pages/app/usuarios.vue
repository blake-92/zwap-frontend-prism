<script setup>
import UsuariosView from '~/components/features/users/UsuariosView.vue'
definePageMeta({ middleware: 'auth', requiresPermission: 'USERS_VIEW' })
</script>

<template>
  <UsuariosView />
</template>
