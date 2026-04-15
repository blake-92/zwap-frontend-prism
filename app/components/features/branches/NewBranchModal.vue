<script setup>
import { ref, computed } from 'vue'
import { Building2 } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import { useThemeStore } from '~/stores/theme'

const emit = defineEmits(['close'])
const { t } = useI18n()
const themeStore = useThemeStore()

const name = ref('')
const address = ref('')
const city = ref('')

const labelClass = computed(() => themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]')

const isDisabled = computed(() => !name.value.trim() || !address.value.trim() || !city.value.trim())
</script>

<template>
  <Modal
    :title="t('branches.newBranch')"
    :description="t('branches.modalDescription')"
    :icon="Building2"
    max-width="480px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-8 space-y-5">
      <div>
        <label :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('branches.branchName').toUpperCase() }}</label>
        <Input v-model="name" :placeholder="t('branches.branchNamePlaceholder')" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('branches.address').toUpperCase() }}</label>
          <Input v-model="address" :placeholder="t('branches.addressPlaceholder')" />
        </div>
        <div>
          <label :class="['block text-xs font-bold tracking-widest mb-2', labelClass]">{{ t('branches.cityRegion').toUpperCase() }}</label>
          <Input v-model="city" :placeholder="t('branches.cityRegionPlaceholder')" />
        </div>
      </div>
      <p :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ t('branches.postCreateHint') }}
      </p>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" @click="emit('close')">{{ t('common.cancel') }}</Button>
      <Button class="flex-1 !py-3.5" :disabled="isDisabled">
        <Building2 :size="18" /> {{ t('branches.createBranch') }}
      </Button>
    </template>
  </Modal>
</template>
