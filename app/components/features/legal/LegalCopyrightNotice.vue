<script setup>
defineProps({
  symbol: { type: String, default: '©' },
  text: { type: String, required: true },
  sub: { type: String, required: true },
})
</script>

<template>
  <div
    class="bg-[#111113] rounded-2xl px-9 py-8 my-6 text-center text-white/70 relative overflow-hidden"
  >
    <!-- Ambient purple glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124, 58, 237, 0.18), transparent 65%)"
    />
    <div class="relative">
      <div
        class="text-[2.5rem] font-extrabold text-[#A78BFA] mb-2 leading-none"
      >
        {{ symbol }}
      </div>
      <div class="text-base font-bold text-white mb-1.5">
        {{ text }}
      </div>
      <div class="text-[13.5px] leading-[1.65]" v-html="sub" />
    </div>
  </div>
</template>
