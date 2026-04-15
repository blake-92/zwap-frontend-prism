<script setup>
import UsuariosView from '~/components/features/users/UsuariosView.vue'
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <UsuariosView />
</template>
