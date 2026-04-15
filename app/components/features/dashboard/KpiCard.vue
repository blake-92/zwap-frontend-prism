<script setup>
import { computed } from 'vue'
import StatCard from '~/components/ui/StatCard.vue'

const props = defineProps({ kpi: { type: Object, required: true } })

const isComparative = computed(() => typeof props.kpi.change === 'string' && props.kpi.change.includes('%'))
const iconVariant = computed(() => props.kpi.variant === 'default' ? 'default' : props.kpi.variant)
const badgeVariant = computed(() => props.kpi.variant === 'default' ? 'outline' : props.kpi.variant)
</script>

<template>
  <StatCard
    :label="kpi.label"
    :value="kpi.value"
    :icon="kpi.icon"
    :icon-variant="iconVariant"
    :badge="kpi.change"
    :badge-variant="badgeVariant"
    :badge-suffix="isComparative ? 'vs. ayer' : ''"
  />
</template>
