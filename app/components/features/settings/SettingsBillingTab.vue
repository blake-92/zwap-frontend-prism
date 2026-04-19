<script setup>
import { computed } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { PLAN_INFO, PAYMENT_CARD } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import SettingItem from './SettingItem.vue'

defineProps({
  showSection: { type: Function, required: true },
})

const { t } = useI18n()
const themeStore = useThemeStore()

const sectionLabelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')
const planBoxClass = computed(() => themeStore.isDarkMode ? 'bg-[#111113]/50 border-white/10' : 'bg-gray-50 border-gray-200')
const planLabelClass = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')
const planTitleClass = computed(() => themeStore.isDarkMode ? 'text-white' : 'text-[#111113]')

const cardDescription = computed(() =>
  `${t('settings.expiration')}: ${PAYMENT_CARD.expiry} • ${PAYMENT_CARD.isPrimary ? t('settings.primaryCard') : t('settings.secondaryCard')}`,
)
</script>

<template>
  <Card v-if="showSection('billing')" class="p-6 md:p-8">
    <h3 :class="['text-sm font-bold tracking-widest uppercase mb-6', sectionLabelClass]">{{ t('settings.paymentMethods') }}</h3>
    <div :class="['p-6 rounded-2xl border mb-6 flex justify-between items-center', planBoxClass]">
      <div>
        <p :class="['text-xs font-bold tracking-widest uppercase mb-1', planLabelClass]">{{ t('settings.currentPlan') }}</p>
        <h4 :class="['text-xl font-bold flex items-center gap-2', planTitleClass]">
          {{ PLAN_INFO.name }} <Badge variant="default">{{ PLAN_INFO.tier }}</Badge>
        </h4>
        <p :class="['text-sm mt-1 font-medium', planLabelClass]">{{ PLAN_INFO.renewDate }} ({{ PLAN_INFO.price }})</p>
      </div>
      <Button variant="outline">{{ t('settings.managePlan') }}</Button>
    </div>
    <div class="flex flex-col">
      <SettingItem
        :icon="CreditCard"
        :title="`${PAYMENT_CARD.brand} ••${PAYMENT_CARD.last4}`"
        :description="cardDescription"
        last
      >
        <Button variant="outline" size="sm">{{ t('common.update') }}</Button>
      </SettingItem>
    </div>
  </Card>
</template>
