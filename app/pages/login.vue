<script setup>
import { ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Mail, Lock, Sun, Moon, ArrowLeft } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { ROUTES } from '~/utils/routes'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { SPRING } from '~/utils/springs'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import ZwapLogo from '~/components/brand/ZwapLogo.vue'
import GlassBackground from '~/components/GlassBackground.vue'

definePageMeta({ layout: false })

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const showEmail = ref(false)
const email = ref('')
const password = ref('')

const handleLogin = () => {
  const token = useCookie('zwap_token', { maxAge: 60 * 60 * 24 * 7 })
  token.value = 'mock-token'
  navigateTo(ROUTES.DASHBOARD)
}

const goLegal = (doc) => navigateTo(`/legal/${doc}`)

const linkCls = 'hover:underline transition-colors hover:text-[#7C3AED] cursor-pointer'
</script>

<template>
  <div class="min-h-screen relative">
    <GlassBackground />

    <motion.div
      :variants="mv.page.value"
      initial="hidden"
      animate="show"
      class="min-h-screen w-full flex flex-col relative z-10 items-center justify-center p-4"
    >
      <!-- Theme toggle -->
      <div class="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <Button variant="ghost" size="icon" :title="t('header.themeToggle')" @click="themeStore.toggleTheme()">
          <component :is="themeStore.isDarkMode ? Sun : Moon" :size="20" />
        </Button>
      </div>

      <!-- Card -->
      <Card :class="[
        'w-full max-w-md p-8 md:p-10 flex flex-col items-center relative z-20',
        themeStore.isDarkMode ? 'shadow-[0_40px_100px_rgba(0,0,0,0.8)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
      ]">
        <div class="mb-8 h-12 flex justify-center items-center w-full">
          <ZwapLogo wrapper-class="h-10" />
        </div>

        <div class="w-full text-center mb-8">
          <h1 :class="['text-2xl font-bold tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
            {{ t('auth.welcomeBack') }}
          </h1>
          <p :class="['text-sm mt-1 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            {{ t('auth.subtitle') }}
          </p>
        </div>

        <div class="w-full space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              v-if="!showEmail"
              key="methods"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="SPRING"
              class="space-y-6"
            >
              <!-- Google button -->
              <button
                :class="[
                  'flex items-center justify-center w-full gap-3 py-3.5 px-4 rounded-xl text-sm font-bold transition-colors duration-200 shadow-md',
                  themeStore.isDarkMode ? 'bg-white hover:bg-gray-100 text-[#111113]' : 'bg-white border border-gray-200 hover:bg-gray-50 text-[#111113]'
                ]"
                @click="handleLogin"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.72 16.79 16.96 15.53 17.8V20.59H19.1C21.01 18.83 22.56 15.8 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.1 20.59L15.53 17.8C14.64 18.4 13.41 18.77 12 18.77C9.27 18.77 6.96 16.92 6.07 14.44H2.41V17.28C4.18 20.79 7.82 23 12 23Z" fill="#34A853"/>
                  <path d="M6.07 14.44C5.84 13.75 5.71 13.01 5.71 12.25C5.71 11.49 5.84 10.75 6.07 10.06V7.22H2.41C1.68 8.68 1.25 10.4 1.25 12.25C1.25 14.1 1.68 15.82 2.41 17.28L6.07 14.44Z" fill="#FBBC05"/>
                  <path d="M12 5.73C13.62 5.73 15.06 6.29 16.21 7.36L19.18 4.39C17.45 2.68 14.96 1.5 12 1.5C7.82 1.5 4.18 3.71 2.41 7.22L6.07 10.06C6.96 7.58 9.27 5.73 12 5.73Z" fill="#EA4335"/>
                </svg>
                {{ t('auth.continueWithGoogle') }}
              </button>

              <!-- Or divider -->
              <div class="flex items-center gap-4 opacity-60">
                <div :class="['flex-1 h-px', themeStore.isDarkMode ? 'bg-white/20' : 'bg-black/10']" />
                <span :class="['text-xs font-semibold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#67656E]']">{{ t('auth.or') }}</span>
                <div :class="['flex-1 h-px', themeStore.isDarkMode ? 'bg-white/20' : 'bg-black/10']" />
              </div>

              <Button variant="ghost" class="w-full !py-3.5" @click="showEmail = true">
                <Mail :size="18" class="mr-2" />
                {{ t('auth.continueWithEmail') }}
              </Button>
            </motion.div>

            <motion.div
              v-else
              key="email-form"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="SPRING"
            >
              <form class="space-y-4" @submit.prevent="handleLogin">
                <div>
                  <label for="login-email" :class="['block text-xs font-bold tracking-wide mb-2', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                    {{ t('auth.email') }}
                  </label>
                  <Input
                    id="login-email"
                    v-model="email"
                    :icon="Mail"
                    type="email"
                    autocomplete="email"
                    placeholder="admin@hotel.com"
                  />
                </div>
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label for="login-password" :class="['block text-xs font-bold tracking-wide', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                      {{ t('auth.password') }}
                    </label>
                    <button
                      type="button"
                      :class="['text-xs font-semibold transition-colors hover:underline', themeStore.isDarkMode ? 'text-[#B9A4F8] hover:text-white' : 'text-[#7C3AED] hover:text-[#561BAF]']"
                    >
                      {{ t('auth.forgotPassword') }}
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    v-model="password"
                    :icon="Lock"
                    type="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" class="w-full !py-3.5 !text-base shadow-lg mt-4">
                  {{ t('auth.login') }}
                </Button>
                <div class="pt-4 text-center">
                  <button
                    type="button"
                    :class="['text-xs font-semibold transition-colors hover:underline flex items-center justify-center w-full gap-1', themeStore.isDarkMode ? 'text-[#888991] hover:text-white' : 'text-[#67656E] hover:text-[#111113]']"
                    @click="showEmail = false"
                  >
                    <ArrowLeft :size="14" /> {{ t('auth.backToMethods') }}
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      <!-- Legal footer -->
      <div :class="[
        'absolute bottom-8 flex flex-col items-center gap-3 text-xs font-medium z-20',
        themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
      ]">
        <div class="flex gap-4">
          <span :class="linkCls" @click="goLegal('terminos')">{{ t('auth.terms') }}</span>
          <span class="opacity-30">•</span>
          <span :class="linkCls" @click="goLegal('privacidad')">{{ t('auth.privacy') }}</span>
        </div>
        <p class="opacity-50 tracking-wide">{{ t('auth.copyright') }}</p>
      </div>
    </motion.div>
  </div>
</template>
