<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  Building2, MapPin, Users, Pencil, Trash2,
  PlusCircle, Star,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { listVariants, cardItemVariants, pageVariants } from '~/utils/motionVariants'
import { BRANCH_LIST } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import NewBranchModal from './NewBranchModal.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const viewSearch = useViewSearch(computed(() => t('branches.searchPlaceholder')))
const newBranchOpen = ref(false)

const filtered = computed(() => {
  const q = viewSearch.query?.toLowerCase()
  if (!q) return BRANCH_LIST
  return BRANCH_LIST.filter(b =>
    b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q),
  )
})

const iconBubbleClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/15 text-[#7C3AED] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
    : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-xs',
)
const descTextClass = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')
</script>

<template>
  <motion.div :variants="pageVariants" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('branches.title')">
      <Button @click="newBranchOpen = true">
        <PlusCircle :size="18" /> {{ t('branches.newBranch') }}
      </Button>
    </PageHeader>

    <div class="sm:hidden mb-6">
      <Button size="lg" class="w-full" @click="newBranchOpen = true">
        <PlusCircle :size="18" /> {{ t('branches.newBranch') }}
      </Button>
    </div>

    <motion.div
      v-if="filtered.length > 0"
      :variants="listVariants"
      initial="hidden"
      animate="show"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8"
    >
      <motion.div v-for="b in filtered" :key="b.id" :variants="cardItemVariants">
        <Card hover-effect class="p-6 cursor-pointer group relative overflow-hidden">
          <div class="flex justify-between items-start mb-5">
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300', iconBubbleClass]">
              <Building2 :size="22" />
            </div>
            <div class="flex items-center gap-2">
              <Tooltip :content="t('branches.editBranch')" position="top">
                <Button variant="action" size="sm" class="!px-2.5 !py-2"><Pencil :size="13" /></Button>
              </Tooltip>
              <Tooltip v-if="!b.isMain" :content="t('branches.deleteBranch')" position="top">
                <Button variant="danger" size="sm" class="!px-2.5 !py-2"><Trash2 :size="13" /></Button>
              </Tooltip>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-1.5">
            <h3 :class="['font-bold text-lg tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ b.name }}</h3>
            <Badge v-if="b.isMain" variant="default">
              <Star :size="9" class="inline mr-0.5" />{{ t('branches.main') }}
            </Badge>
          </div>
          <p :class="['text-xs font-medium flex items-center gap-1.5 mb-5', descTextClass]">
            <MapPin :size="12" class="opacity-70 shrink-0" />
            {{ b.address }}
          </p>
          <div :class="['pt-4 border-t flex items-center gap-2', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
            <Users :size="14" :class="themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'" />
            <span :class="['text-xs font-bold', descTextClass]">
              {{ t('branches.usersAssigned', { count: b.users }, b.users) }}
            </span>
          </div>
        </Card>
      </motion.div>

      <motion.div v-if="!viewSearch.query" :variants="cardItemVariants">
        <button
          :class="[
            'rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] transition-all duration-300 group w-full',
            themeStore.isDarkMode
              ? 'border-white/10 text-[#888991] hover:border-[#7C3AED]/40 hover:text-[#A78BFA] hover:bg-[#7C3AED]/5'
              : 'border-gray-200 text-[#B0AFB4] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#DBD3FB]/10'
          ]"
          @click="newBranchOpen = true"
        >
          <PlusCircle :size="28" class="transition-transform duration-300 group-hover:scale-110" />
          <span class="text-sm font-bold">{{ t('branches.newBranch') }}</span>
        </button>
      </motion.div>
    </motion.div>

    <Card v-else class="p-8 text-center">
      <p :class="['text-sm font-medium', descTextClass]">
        {{ viewSearch.query ? t('branches.notFoundFor', { term: viewSearch.query }) : t('branches.notFound') }}
      </p>
      <Button v-if="viewSearch.query" variant="ghost" size="sm" class="mt-2" @click="viewSearch.setQuery('')">
        {{ t('common.clearSearch') }}
      </Button>
    </Card>

    <AnimatePresence>
      <NewBranchModal v-if="newBranchOpen" key="new-branch" @close="newBranchOpen = false" />
    </AnimatePresence>
  </motion.div>
</template>
