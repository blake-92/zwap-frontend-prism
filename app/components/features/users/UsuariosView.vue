<script setup>
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Download, UserPlus, Users, Pencil, Trash2, Filter } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { USERS } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import AvatarInfo from '~/components/ui/AvatarInfo.vue'
import Toggle from '~/components/ui/Toggle.vue'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'
import NewUserModal from './NewUserModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const viewSearch = useViewSearch(computed(() => t('users.searchPlaceholder')))
const users = ref(USERS.map(u => ({ ...u })))
const newUserOpen = ref(false)

const ROLE_VARIANT = { Contador: 'warning', Recepcionista: 'success', Administrador: 'default' }
const ROLE_LABEL = computed(() => ({
  Administrador: t('users.roleAdmin'),
  Contador: t('users.roleAccountant'),
  Recepcionista: t('users.roleReceptionist'),
}))

const defaultRole = computed(() => t('filters.all'))
const defaultStatus = computed(() => t('filters.all'))
const roleFilter = ref('')
const statusFilter = ref('')
watch(defaultRole, (v) => { if (!roleFilter.value) roleFilter.value = v }, { immediate: true })
watch(defaultStatus, (v) => { if (!statusFilter.value) statusFilter.value = v }, { immediate: true })

const filtersActive = computed(() =>
  (roleFilter.value !== defaultRole.value ? 1 : 0) +
  (statusFilter.value !== defaultStatus.value ? 1 : 0),
)
watch(filtersActive, (v) => viewSearch.setActiveFilterCount(v), { immediate: true })

const resetFilters = () => {
  roleFilter.value = defaultRole.value
  statusFilter.value = defaultStatus.value
}

const filtered = computed(() => {
  const q = viewSearch.query?.toLowerCase() || ''
  return users.value.filter(u => {
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    let matchRole = true
    if (roleFilter.value !== defaultRole.value) {
      const translatedRole = ROLE_LABEL.value[u.role] || u.role
      matchRole = translatedRole === roleFilter.value || u.role === roleFilter.value
    }
    let matchStatus = true
    if (statusFilter.value !== defaultStatus.value) {
      const isActive = statusFilter.value === t('filters.active')
      matchStatus = u.active === isActive
    }
    return matchSearch && matchRole && matchStatus
  })
})

const toggleUser = (id) => {
  const u = users.value.find(x => x.id === id)
  if (u) u.active = !u.active
}

const theadClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
    : 'text-[#67656E] border-b border-black/5 bg-white/50',
)
const trClass = computed(() =>
  themeStore.isDarkMode
    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0',
)
const branchChipClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-white/5 border-white/10 text-[#888991]'
    : 'bg-gray-50 border-gray-200 text-[#67656E]',
)
const branchOverflowClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#A78BFA]'
    : 'bg-[#DBD3FB]/40 border-[#7C3AED]/20 text-[#7C3AED]',
)
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('users.title')">
      <Button @click="newUserOpen = true">
        <UserPlus :size="18" /> {{ t('users.newUser') }}
      </Button>
    </PageHeader>

    <div class="sm:hidden mb-6">
      <Button size="lg" class="w-full" @click="newUserOpen = true">
        <UserPlus :size="18" /> {{ t('users.newUser') }}
      </Button>
    </div>

    <TableToolbar :has-actions="true" :on-reset="filtersActive > 0 ? resetFilters : undefined" @reset="resetFilters">
      <DropdownFilter
        :label="t('users.tableRole')"
        :icon="Users"
        :options="[defaultRole, t('users.roleAdmin'), t('users.roleAccountant'), t('users.roleReceptionist')]"
        :default-value="defaultRole"
        :model-value="roleFilter"
        @update:model-value="roleFilter = $event"
      />
      <DropdownFilter
        :label="t('filters.status')"
        :icon="Filter"
        :options="[defaultStatus, t('filters.active'), t('filters.inactive')]"
        :default-value="defaultStatus"
        :model-value="statusFilter"
        @update:model-value="statusFilter = $event"
      />
      <template #actions>
        <Button variant="successExport" size="sm" class="!px-3">
          <Download :size="14" />
          <span class="ml-1.5">{{ t('common.exportCsv') }}</span>
        </Button>
      </template>
    </TableToolbar>

    <!-- Desktop table -->
    <Card class="pb-2 hidden lg:block">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
              <th class="px-8 py-4 min-w-[240px]">{{ t('users.tableUser') }}</th>
              <th class="px-6 py-4 min-w-[130px]">{{ t('users.tableRole') }}</th>
              <th class="px-6 py-4 min-w-[260px]">{{ t('users.tableBranches') }}</th>
              <th class="px-6 py-4 text-center min-w-[100px]">{{ t('filters.status') }}</th>
              <th class="px-8 py-4 text-right min-w-[120px]">{{ t('transactions.tableActions') }}</th>
            </tr>
          </thead>
          <motion.tbody :variants="mv.list.value" initial="hidden" animate="show">
            <template v-if="filtered.length === 0">
              <EmptySearchState :col-span="5" :term="viewSearch.query" @clear="viewSearch.setQuery('')" />
            </template>
            <motion.tr
              v-for="user in filtered"
              v-else
              :key="user.id"
              :variants="mv.item.value"
              :class="['group transition-colors duration-200', trClass]"
            >
              <td class="px-8 py-4">
                <AvatarInfo :initials="user.initials" :primary="user.name" :secondary="user.email" glow />
              </td>
              <td class="px-6 py-4">
                <Badge :variant="ROLE_VARIANT[user.role] || 'default'">
                  {{ ROLE_LABEL[user.role] || user.role }}
                </Badge>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="b in user.branches.slice(0, 2)"
                    :key="b"
                    :class="['text-[10px] font-bold px-2 py-0.5 rounded-lg border', branchChipClass]"
                  >{{ b }}</span>
                  <span
                    v-if="user.branches.length > 2"
                    :class="['text-[10px] font-bold px-2 py-0.5 rounded-lg border', branchOverflowClass]"
                  >+{{ user.branches.length - 2 }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <Toggle :active="user.active" @toggle="toggleUser(user.id)" />
              </td>
              <td class="px-8 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <Tooltip :content="t('users.editUser')" position="top">
                    <Button variant="action" size="sm" class="!px-3 !py-2"><Pencil :size="14" /></Button>
                  </Tooltip>
                  <Tooltip :content="t('users.deleteUser')" position="top">
                    <Button variant="danger" size="sm" class="!px-3 !py-2"><Trash2 :size="14" /></Button>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          </motion.tbody>
        </table>
      </div>
    </Card>

    <!-- Mobile cards -->
    <div class="lg:hidden space-y-3">
      <motion.div
        v-if="filtered.length > 0"
        :variants="mv.list.value"
        initial="hidden"
        animate="show"
        class="space-y-3"
      >
        <motion.div v-for="user in filtered" :key="user.id" :variants="mv.item.value">
          <Card class="p-4">
            <div class="flex items-start justify-between gap-3 mb-3">
              <AvatarInfo :initials="user.initials" :primary="user.name" :secondary="user.email" glow />
              <Toggle :active="user.active" @toggle="toggleUser(user.id)" />
            </div>
            <div class="flex items-center gap-2 flex-wrap mb-3">
              <Badge :variant="ROLE_VARIANT[user.role] || 'default'">{{ ROLE_LABEL[user.role] || user.role }}</Badge>
              <span class="opacity-40">|</span>
              <span
                v-for="b in user.branches.slice(0, 2)"
                :key="b"
                :class="['text-[10px] font-bold px-2 py-0.5 rounded-lg border', branchChipClass]"
              >{{ b }}</span>
              <span
                v-if="user.branches.length > 2"
                :class="['text-[10px] font-bold px-2 py-0.5 rounded-lg border', branchOverflowClass]"
              >+{{ user.branches.length - 2 }}</span>
            </div>
            <div :class="['flex items-center gap-2 pt-3 border-t', themeStore.isDarkMode ? 'border-white/5' : 'border-black/5']">
              <Button variant="action" size="sm" class="!px-3 !py-1.5 flex-1">
                <Pencil :size="14" /> {{ t('common.edit') }}
              </Button>
              <Button variant="danger" size="sm" class="!px-3 !py-1.5 flex-1">
                <Trash2 :size="14" /> {{ t('common.delete') }}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      <Card v-else class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ viewSearch.query ? t('errors.noResultsFor', { term: viewSearch.query }) : t('errors.noResults') }}
        </p>
        <Button v-if="viewSearch.query" variant="ghost" size="sm" class="mt-2" @click="viewSearch.setQuery('')">
          {{ t('common.clearSearch') }}
        </Button>
      </Card>
    </div>

    <AnimatePresence>
      <NewUserModal v-if="newUserOpen" key="new-user" @close="newUserOpen = false" />
    </AnimatePresence>
  </motion.div>
</template>
