<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  UserPlus, Users, Pencil, Trash2, Filter,
  Pause, Play, Loader2,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useSessionStore } from '~/stores/session'
import { useUsersStore } from '~/stores/users'
import { useToastStore } from '~/stores/toast'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { useFilterSlot } from '~/composables/useFilterSlot'
import {
  ROLE_BADGE_VARIANT, STATUS_BADGE_VARIANT,
  formatRoleAssignment,
} from '~/utils/roles'
import { ApiError } from '~/utils/api'
import { getTheadClass, getTableRowClass } from '~/utils/cardClasses'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import AvatarInfo from '~/components/ui/AvatarInfo.vue'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'
import NewUserModal from './NewUserModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const sessionStore = useSessionStore()
const usersStore = useUsersStore()
const toastStore = useToastStore()
const viewSearch = useViewSearch(computed(() => t('users.searchPlaceholder')))
const newUserOpen = ref(false)

// Permisos del cutover doc § 4.3.
const canView = computed(() => sessionStore.hasPermission('USERS_VIEW'))
const canInvite = computed(() => sessionStore.hasPermission('USERS_INVITE'))
const canManageRoles = computed(() => sessionStore.hasPermission('USERS_MANAGE_ROLES'))
const canRemove = computed(() => sessionStore.hasPermission('USERS_REMOVE'))
const currentUserId = computed(() => sessionStore.user?.id)

onMounted(async () => {
  if (!canView.value) return
  if (usersStore.items.length === 0 && !usersStore.loading) {
    try {
      await usersStore.fetch()
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // RECEPTIONIST con sidebar item visible — backend rechaza, mostramos placeholder.
        return
      }
      toastStore.addToast(t('users.loadFailed'), 'error')
    }
  }
})

const formatRoles = (user) => {
  if (!user.roles?.length) return t('users.noRoles')
  return user.roles.map((r) => formatRoleAssignment(t, r)).join(', ')
}

// Filtros: rol y status. useFilterSlot maneja default + dirty + reset.
const ROLE_OPTIONS = computed(() => [
  t('filters.all'),
  t('roles.OWNER'),
  t('roles.ADMIN'),
  t('roles.ACCOUNTANT'),
  t('roles.RECEPTIONIST'),
])
const STATUS_OPTIONS = computed(() => [
  t('filters.all'),
  t('userStatus.ACTIVE'),
  t('userStatus.PENDING_INVITE'),
  t('userStatus.SUSPENDED'),
  t('userStatus.ARCHIVED'),
])

const {
  current: roleFilter, defaultValue: defaultRole,
  isDirty: roleDirty, reset: resetRole,
} = useFilterSlot(() => t('filters.all'))
const {
  current: statusFilter, defaultValue: defaultStatus,
  isDirty: statusDirty, reset: resetStatus,
} = useFilterSlot(() => t('filters.all'))

const filtersActive = computed(() => (roleDirty.value ? 1 : 0) + (statusDirty.value ? 1 : 0))
watch(filtersActive, (v) => viewSearch.setActiveFilterCount(v), { immediate: true })

const resetFilters = () => {
  resetRole()
  resetStatus()
}

const filtered = computed(() => {
  const q = viewSearch.query?.toLowerCase() || ''
  return usersStore.items.filter((u) => {
    const name = (u.fullName || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    const matchSearch = !q || name.includes(q) || email.includes(q)

    let matchRole = true
    if (roleDirty.value) {
      const roleCodes = (u.roles ?? []).map((r) => r.roleCode)
      matchRole = roleCodes.some((c) => t(`roles.${c}`) === roleFilter.value)
    }
    let matchStatus = true
    if (statusDirty.value) {
      matchStatus = t(`userStatus.${u.status}`) === statusFilter.value
    }
    return matchSearch && matchRole && matchStatus
  })
})

const userInitials = (user) => {
  const name = user.fullName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return user.email?.[0]?.toUpperCase() || '—'
}

const primaryRoleCode = (user) => user.roles?.[0]?.roleCode ?? null

// Acciones — handler común con mapeo de errores 409 conocidos del backend.
const handleAction = async (action, user) => {
  try {
    if (action === 'suspend') await usersStore.suspend(user.id)
    if (action === 'reactivate') await usersStore.reactivate(user.id)
    if (action === 'archive') await usersStore.archive(user.id)
    const successKey = action === 'suspend' ? 'users.suspendSuccess'
      : action === 'reactivate' ? 'users.reactivateSuccess'
      : 'users.archiveSuccess'
    toastStore.addToast(t(successKey), 'success')
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const map = {
        cannot_suspend_self: 'users.errorCannotSuspendSelf',
        cannot_archive_self: 'users.errorCannotArchiveSelf',
        merchant_must_have_owner: 'users.errorMustHaveOwner',
      }
      const key = map[err.message] ?? 'errors.unexpected'
      toastStore.addToast(t(key), 'error')
    } else if (err instanceof ApiError && err.status === 403) {
      toastStore.addToast(t('errors.permissionDenied'), 'error')
    } else {
      toastStore.addToast(t('errors.unexpected'), 'error')
    }
  }
}

const theadClass = computed(() => getTheadClass(themeStore.isDarkMode, perfStore.isLite))
const trClass = computed(() => getTableRowClass(themeStore.isDarkMode))
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('users.title')">
      <Button v-if="canInvite" @click="newUserOpen = true">
        <UserPlus :size="18" /> {{ t('users.newUser') }}
      </Button>
    </PageHeader>

    <div v-if="canInvite" class="sm:hidden mb-6">
      <Button size="lg" class="w-full" @click="newUserOpen = true">
        <UserPlus :size="18" /> {{ t('users.newUser') }}
      </Button>
    </div>

    <!-- Sin permiso de view → placeholder. Sidebar muestra el item por gating client-side
         imperfecto, pero esta vista anuncia el rechazo del backend de forma honesta. -->
    <Card v-if="!canView" class="p-12 text-center">
      <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ t('errors.permissionDenied') }}
      </p>
    </Card>

    <template v-else>
      <TableToolbar :has-actions="false" :on-reset="filtersActive > 0 ? resetFilters : undefined" @reset="resetFilters">
        <DropdownFilter
          :label="t('users.tableRole')"
          :icon="Users"
          :options="ROLE_OPTIONS"
          :default-value="defaultRole"
          :model-value="roleFilter"
          @update:model-value="roleFilter = $event"
        />
        <DropdownFilter
          :label="t('users.tableStatus')"
          :icon="Filter"
          :options="STATUS_OPTIONS"
          :default-value="defaultStatus"
          :model-value="statusFilter"
          @update:model-value="statusFilter = $event"
        />
      </TableToolbar>

      <Card v-if="usersStore.loading && usersStore.items.length === 0" class="p-12 text-center">
        <Loader2 :size="24" class="animate-spin mx-auto opacity-50" />
      </Card>

      <!-- Desktop table -->
      <Card v-else class="pb-2 hidden lg:block">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
                <th class="px-8 py-4 min-w-[260px]">{{ t('users.tableUser') }}</th>
                <th class="px-6 py-4 min-w-[260px]">{{ t('users.tableRole') }}</th>
                <th class="px-6 py-4 min-w-[140px]">{{ t('users.tableStatus') }}</th>
                <th class="px-8 py-4 text-right min-w-[160px]">{{ t('transactions.tableActions') }}</th>
              </tr>
            </thead>
            <motion.tbody :variants="mv.list.value" initial="hidden" animate="show">
              <template v-if="filtered.length === 0">
                <EmptySearchState :col-span="4" :term="viewSearch.query" @clear="viewSearch.setQuery('')" />
              </template>
              <motion.tr
                v-for="user in filtered"
                v-else
                :key="user.id"
                :variants="mv.item.value"
                :class="['group transition-colors duration-200', trClass]"
              >
                <td class="px-8 py-4">
                  <AvatarInfo :initials="userInitials(user)" :primary="user.fullName || user.email" :secondary="user.fullName ? user.email : ''" glow />
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <Badge v-if="primaryRoleCode(user)" :variant="ROLE_BADGE_VARIANT[primaryRoleCode(user)] || 'default'">
                      {{ t(`roles.${primaryRoleCode(user)}`) }}
                    </Badge>
                    <span v-if="user.roles?.length" :class="['text-[11px] font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                      {{ formatRoles(user) }}
                    </span>
                    <span v-else :class="['text-[11px] font-medium italic opacity-60', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                      {{ t('users.noRoles') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="STATUS_BADGE_VARIANT[user.status] || 'default'">
                    {{ t(`userStatus.${user.status}`) }}
                  </Badge>
                </td>
                <td class="px-8 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Tooltip v-if="canManageRoles" :content="t('users.editRoles')" position="top">
                      <Button :aria-label="t('users.editRoles')" variant="action" size="sm" class="!px-3 !py-2"><Pencil :size="14" /></Button>
                    </Tooltip>
                    <Tooltip v-if="canRemove && user.status === 'ACTIVE' && user.id !== currentUserId" :content="t('users.suspendUser')" position="top">
                      <Button :aria-label="t('users.suspendUser')" variant="action" size="sm" class="!px-3 !py-2" @click="handleAction('suspend', user)">
                        <Pause :size="14" />
                      </Button>
                    </Tooltip>
                    <Tooltip v-if="canRemove && user.status === 'SUSPENDED'" :content="t('users.reactivateUser')" position="top">
                      <Button :aria-label="t('users.reactivateUser')" variant="action" size="sm" class="!px-3 !py-2" @click="handleAction('reactivate', user)">
                        <Play :size="14" />
                      </Button>
                    </Tooltip>
                    <Tooltip v-if="canRemove && user.status !== 'ARCHIVED' && user.id !== currentUserId" :content="t('users.deleteUser')" position="top">
                      <Button :aria-label="t('users.deleteUser')" variant="danger" size="sm" class="!px-3 !py-2" @click="handleAction('archive', user)">
                        <Trash2 :size="14" />
                      </Button>
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
                <AvatarInfo :initials="userInitials(user)" :primary="user.fullName || user.email" :secondary="user.fullName ? user.email : ''" glow />
                <Badge :variant="STATUS_BADGE_VARIANT[user.status] || 'default'">
                  {{ t(`userStatus.${user.status}`) }}
                </Badge>
              </div>
              <div class="flex items-center gap-2 flex-wrap mb-3">
                <Badge v-if="primaryRoleCode(user)" :variant="ROLE_BADGE_VARIANT[primaryRoleCode(user)] || 'default'">
                  {{ t(`roles.${primaryRoleCode(user)}`) }}
                </Badge>
                <span v-if="user.roles?.length" :class="['text-[11px] font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ formatRoles(user) }}
                </span>
              </div>
              <div v-if="canManageRoles || canRemove" :class="['flex items-center gap-2 pt-3 border-t', themeStore.isDarkMode ? 'border-white/5' : 'border-black/5']">
                <Button v-if="canManageRoles" variant="action" size="sm" class="!px-3 !py-1.5 flex-1">
                  <Pencil :size="14" /> {{ t('users.editRoles') }}
                </Button>
                <Button v-if="canRemove && user.status === 'ACTIVE' && user.id !== currentUserId" variant="action" size="sm" class="!px-3 !py-1.5 flex-1" @click="handleAction('suspend', user)">
                  <Pause :size="14" /> {{ t('users.suspendUser') }}
                </Button>
                <Button v-if="canRemove && user.status === 'SUSPENDED'" variant="action" size="sm" class="!px-3 !py-1.5 flex-1" @click="handleAction('reactivate', user)">
                  <Play :size="14" /> {{ t('users.reactivateUser') }}
                </Button>
                <Button v-if="canRemove && user.status !== 'ARCHIVED' && user.id !== currentUserId" variant="danger" size="sm" class="!px-3 !py-1.5 flex-1" @click="handleAction('archive', user)">
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
    </template>

    <AnimatePresence>
      <NewUserModal v-if="newUserOpen" key="new-user" @close="newUserOpen = false" />
    </AnimatePresence>
  </motion.div>
</template>
