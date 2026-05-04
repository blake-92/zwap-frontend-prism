<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  Building2, Pencil, Trash2, PlusCircle, Star,
  RefreshCcw, EyeOff, Eye, Loader2,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useSessionStore } from '~/stores/session'
import { useBranchesStore } from '~/stores/branches'
import { useToastStore } from '~/stores/toast'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { ApiError } from '~/utils/api'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import Toggle from '~/components/ui/Toggle.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import NewBranchModal from './NewBranchModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const sessionStore = useSessionStore()
const branchesStore = useBranchesStore()
const toastStore = useToastStore()
const viewSearch = useViewSearch(computed(() => t('branches.searchPlaceholder')))
const newBranchOpen = ref(false)
const editingBranch = ref(null)
const showArchived = ref(false)

const canManage = computed(() => sessionStore.hasPermission('BRANCHES_MANAGE'))

// El layout dispara fetch al login; este re-fetch es defensivo si el user entra directamente
// a /app/sucursales y la lista todavía está cold.
if (sessionStore.isAuthenticated && branchesStore.items.length === 0 && !branchesStore.loading) {
  branchesStore.fetch().catch(() => {
    toastStore.addToast(t('branches.loadFailed'), 'error')
  })
}

const visibleBranches = computed(() => {
  const all = showArchived.value ? branchesStore.items : branchesStore.active
  const q = viewSearch.query?.toLowerCase()
  if (!q) return all
  return all.filter((b) =>
    b.name.toLowerCase().includes(q) || (b.code || '').toLowerCase().includes(q),
  )
})

const handleArchive = async (branch) => {
  if (!canManage.value) return
  try {
    await branchesStore.archive(branch.id)
    toastStore.addToast(t('branches.archiveSuccess'), 'success')
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      toastStore.addToast(t('branches.errorCannotArchivePrimary'), 'error')
    } else {
      toastStore.addToast(t('errors.unexpected'), 'error')
    }
  }
}

const handleReactivate = async (branch) => {
  if (!canManage.value) return
  try {
    await branchesStore.reactivate(branch.id)
    toastStore.addToast(t('branches.reactivateSuccess'), 'success')
  } catch {
    toastStore.addToast(t('errors.unexpected'), 'error')
  }
}

const handlePromotePrimary = async (branch) => {
  if (!canManage.value) return
  try {
    await branchesStore.update(branch.id, { isPrimary: true })
    toastStore.addToast(t('branches.primaryUpdated'), 'success')
  } catch {
    toastStore.addToast(t('errors.unexpected'), 'error')
  }
}

const iconBubbleClass = computed(() => {
  const neonGlow = perfStore.useNeon ? ' group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : ''
  return themeStore.isDarkMode
    ? `bg-[#7C3AED]/15 text-[#7C3AED]${neonGlow}`
    : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-xs'
})
const descTextClass = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')

const cardClass = (branch) => [
  'p-6 cursor-default group relative overflow-hidden',
  branch.status === 'ARCHIVED' ? 'opacity-60' : '',
]
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('branches.title')">
      <Button v-if="canManage" @click="newBranchOpen = true">
        <PlusCircle :size="18" /> {{ t('branches.newBranch') }}
      </Button>
    </PageHeader>

    <div v-if="canManage" class="sm:hidden mb-6">
      <Button size="lg" class="w-full" @click="newBranchOpen = true">
        <PlusCircle :size="18" /> {{ t('branches.newBranch') }}
      </Button>
    </div>

    <!-- Toggle archive visibility (always visible — no permiso requerido para ver archivadas). -->
    <div class="mb-6 flex items-center gap-3">
      <component :is="showArchived ? Eye : EyeOff" :size="16" :class="descTextClass" />
      <span :class="['text-sm font-medium flex-1', descTextClass]">{{ t('branches.showArchived') }}</span>
      <Toggle :active="showArchived" :aria-label="t('branches.showArchived')" @toggle="showArchived = !showArchived" />
    </div>

    <!-- Loading state — solo si la lista está cold y se está cargando. -->
    <Card v-if="branchesStore.loading && branchesStore.items.length === 0" class="p-12 text-center">
      <Loader2 :size="24" class="animate-spin mx-auto opacity-50" />
    </Card>

    <motion.div
      v-else-if="visibleBranches.length > 0"
      :variants="mv.list.value"
      initial="hidden"
      animate="show"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8"
    >
      <motion.div v-for="b in visibleBranches" :key="b.id" :variants="mv.cardItem.value">
        <Card :class="cardClass(b)">
          <div class="flex justify-between items-start mb-5">
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300', iconBubbleClass]">
              <Building2 :size="22" />
            </div>
            <div class="flex items-center gap-2">
              <Tooltip v-if="canManage && b.status === 'ACTIVE' && !b.isPrimary" :content="t('branches.promotePrimary')" position="top">
                <Button :aria-label="t('branches.promotePrimary')" variant="action" size="sm" class="!px-2.5 !py-2" @click="handlePromotePrimary(b)">
                  <Star :size="13" />
                </Button>
              </Tooltip>
              <Tooltip v-if="canManage && b.status === 'ACTIVE'" :content="t('branches.editBranch')" position="top">
                <Button :aria-label="t('branches.editBranch')" variant="action" size="sm" class="!px-2.5 !py-2" @click="editingBranch = b">
                  <Pencil :size="13" />
                </Button>
              </Tooltip>
              <Tooltip v-if="canManage && b.status === 'ACTIVE' && !b.isPrimary" :content="t('branches.archiveBranch')" position="top">
                <Button :aria-label="t('branches.archiveBranch')" variant="danger" size="sm" class="!px-2.5 !py-2" @click="handleArchive(b)">
                  <Trash2 :size="13" />
                </Button>
              </Tooltip>
              <Tooltip v-if="canManage && b.status === 'ARCHIVED'" :content="t('branches.reactivateBranch')" position="top">
                <Button :aria-label="t('branches.reactivateBranch')" variant="action" size="sm" class="!px-2.5 !py-2" @click="handleReactivate(b)">
                  <RefreshCcw :size="13" />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 :class="['font-bold text-lg tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ b.name }}</h3>
            <Badge v-if="b.isPrimary" variant="default">
              <Star :size="9" class="inline mr-0.5" />{{ t('branches.main') }}
            </Badge>
            <Badge v-if="b.status === 'ARCHIVED'" variant="warning">
              {{ t('branches.archivedLabel') }}
            </Badge>
          </div>
          <p :class="['text-xs font-medium mb-5', descTextClass]">
            <span v-if="b.code" class="font-mono uppercase">{{ b.code }}</span>
            <span v-else class="italic opacity-60">{{ t('branches.codeHint') }}</span>
          </p>
        </Card>
      </motion.div>

      <motion.div v-if="canManage && !viewSearch.query && !showArchived" :variants="mv.cardItem.value">
        <button
          :class="[
            'rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] transition-colors duration-300 group w-full',
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
      <NewBranchModal
        v-if="newBranchOpen"
        key="new-branch"
        @close="newBranchOpen = false"
      />
    </AnimatePresence>
    <AnimatePresence>
      <NewBranchModal
        v-if="editingBranch"
        key="edit-branch"
        :branch="editingBranch"
        @close="editingBranch = null"
      />
    </AnimatePresence>
  </motion.div>
</template>
