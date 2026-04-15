<script setup>
import Button from '~/components/ui/Button.vue'
import GlassBackground from '~/components/GlassBackground.vue'
import ZwapLogo from '~/components/brand/ZwapLogo.vue'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  error: { type: Object, required: true },
})

const { t } = useI18n()
const themeStore = useThemeStore()

const code = computed(() => props.error?.statusCode ?? 500)
const message = computed(() => props.error?.message ?? t('errors.somethingWrong'))

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4">
    <GlassBackground />
    <div class="relative z-10 flex flex-col items-center text-center max-w-md">
      <ZwapLogo wrapper-class="h-12 mb-8" />
      <h1 :class="['font-mono text-6xl font-bold tracking-tighter mb-4', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        {{ code }}
      </h1>
      <p :class="['text-sm font-medium mb-8', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ message }}
      </p>
      <Button @click="handleError">
        {{ t('errors.retry') }}
      </Button>
    </div>
  </div>
</template>
