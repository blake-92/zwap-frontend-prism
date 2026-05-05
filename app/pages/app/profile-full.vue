<script setup>
import ProfileFullView from '~/components/features/kyb/ProfileFullView.vue'

// Cualquier user autenticado puede VER el profile FULL — el ProfileFullView lo gating internamente
// (lock badge si no tiene SETTINGS_MERCHANT). El backend hace el enforcement real (PATCH/PUT/submit
// devuelven 403 sin el permiso). NO declaramos requiresPermission porque queremos que recepcionistas
// puedan VISUALIZAR su propio progreso aunque no editen.
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <ProfileFullView />
</template>
