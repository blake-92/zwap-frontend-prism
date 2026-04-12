import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, UserPlus, Users,
  Pencil, Trash2, Filter,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { Card, Button, Badge, AvatarInfo, Toggle, DropdownFilter, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { USERS } from '@/services/mocks/mockData'
import NewUserModal from './NewUserModal'

/* ─── Role color map ──────────────────────────────────────── */
const ROLE_VARIANT = {
  Contador:      'warning',
  Recepcionista: 'success',
  Administrador: 'default',
}

export default function UsuariosView() {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [users, setUsers] = useState(USERS)
  const { query: search, setQuery: setSearch, setActiveFilterCount } = useViewSearch(t('users.searchPlaceholder'))
  const [newUserOpen, setNewUserOpen] = useState(false)

  const defaultRole   = t('filters.all')
  const defaultStatus = t('filters.all')
  const [roleFilter, setRoleFilter]     = useState(defaultRole)
  const [statusFilter, setStatusFilter] = useState(defaultStatus)

  const filtersActive = (roleFilter !== defaultRole ? 1 : 0) + (statusFilter !== defaultStatus ? 1 : 0)
  useEffect(() => { setActiveFilterCount(filtersActive) }, [filtersActive, setActiveFilterCount])

  const resetFilters = () => {
    setRoleFilter(defaultRole)
    setStatusFilter(defaultStatus)
  }

  const ROLE_LABEL = {
    Administrador: t('users.roleAdmin'),
    Contador: t('users.roleAccountant'),
    Recepcionista: t('users.roleReceptionist'),
  }

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    // Role filter: compare against translated label or raw value
    let matchRole = true
    if (roleFilter !== defaultRole) {
      const translatedRole = ROLE_LABEL[u.role] || u.role
      matchRole = translatedRole === roleFilter || u.role === roleFilter
    }

    // Status filter
    let matchStatus = true
    if (statusFilter !== defaultStatus) {
      const isActive = statusFilter === t('filters.active')
      matchStatus = u.active === isActive
    }

    return matchSearch && matchRole && matchStatus
  }), [users, search, roleFilter, statusFilter, defaultRole, defaultStatus, t])

  const toggleUser = id =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))


  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader title={t('users.title')} description={t('users.description')}>
        <Button onClick={() => setNewUserOpen(true)}>
          <UserPlus size={18} /> {t('users.newUser')}
        </Button>
      </PageHeader>

      <TableToolbar
        onReset={filtersActive > 0 ? resetFilters : undefined}
        actions={
          <Button variant="successExport" size="sm" className="!px-3">
            <Download size={14} />
            <span className="ml-1.5">{t('common.exportCsv')}</span>
          </Button>
        }
      >
        <DropdownFilter
          label={t('users.tableRole')}
          icon={Users}
          options={[defaultRole, t('users.roleAdmin'), t('users.roleAccountant'), t('users.roleReceptionist')]}
          defaultValue={defaultRole}
          value={roleFilter}
          onChange={setRoleFilter}
        />
        <DropdownFilter
          label={t('filters.status')}
          icon={Filter}
          options={[defaultStatus, t('filters.active'), t('filters.inactive')]}
          defaultValue={defaultStatus}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4 min-w-[240px]">{t('users.tableUser')}</th>
                <th className="px-6 py-4 min-w-[130px]">{t('users.tableRole')}</th>
                <th className="px-6 py-4 min-w-[260px]">{t('users.tableBranches')}</th>
                <th className="px-6 py-4 text-center min-w-[100px]">{t('filters.status')}</th>
                <th className="px-8 py-4 text-right min-w-[120px]">{t('transactions.tableActions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {filtered.length === 0 ? (
                <EmptySearchState colSpan={5} term={search} onClear={() => setSearch('')} />
              ) : filtered.map((user) => (
                <motion.tr
                  variants={itemVariants}
                  key={user.id}
                  className={`group transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                      : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                  }`}
                >
                  {/* Usuario */}
                  <td className="px-8 py-4">
                    <AvatarInfo
                      initials={user.initials}
                      primary={user.name}
                      secondary={user.email}
                      glow
                    />
                  </td>

                  {/* Rol */}
                  <td className="px-6 py-4">
                    <Badge variant={ROLE_VARIANT[user.role] || 'default'}>
                      {ROLE_LABEL[user.role] || user.role}
                    </Badge>
                  </td>

                  {/* Sucursales */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.branches.slice(0, 2).map(b => (
                        <span
                          key={b}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                            isDarkMode
                              ? 'bg-white/5 border-white/10 text-[#888991]'
                              : 'bg-gray-50 border-gray-200 text-[#67656E]'
                          }`}
                        >
                          {b}
                        </span>
                      ))}
                      {user.branches.length > 2 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          isDarkMode
                            ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#A78BFA]'
                            : 'bg-[#DBD3FB]/40 border-[#7C3AED]/20 text-[#7C3AED]'
                        }`}>
                          +{user.branches.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <Toggle
                      active={user.active}
                      onToggle={() => toggleUser(user.id)}
                    />
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content={t('users.editUser')} position="top">
                        <Button variant="action" size="sm" className="!px-3 !py-2">
                          <Pencil size={14} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('users.deleteUser')} position="top">
                        <Button variant="danger" size="sm" className="!px-3 !py-2">
                          <Trash2 size={14} />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </Card>

      {/* Cards (mobile / tablet) */}
      <div className="lg:hidden space-y-3">
        {filtered.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((user) => (
              <motion.div key={user.id} variants={itemVariants}>
                <Card className="p-4">
                  {/* Header: avatar + toggle */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <AvatarInfo
                      initials={user.initials}
                      primary={user.name}
                      secondary={user.email}
                      glow
                    />
                    <Toggle
                      active={user.active}
                      onToggle={() => toggleUser(user.id)}
                    />
                  </div>

                  {/* Role + branches */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant={ROLE_VARIANT[user.role] || 'default'}>
                      {ROLE_LABEL[user.role] || user.role}
                    </Badge>
                    <span className="opacity-40">|</span>
                    {user.branches.slice(0, 2).map(b => (
                      <span
                        key={b}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10 text-[#888991]'
                            : 'bg-gray-50 border-gray-200 text-[#67656E]'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                    {user.branches.length > 2 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#A78BFA]'
                          : 'bg-[#DBD3FB]/40 border-[#7C3AED]/20 text-[#7C3AED]'
                      }`}>
                        +{user.branches.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center gap-2 pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <Button variant="action" size="sm" className="!px-3 !py-1.5 flex-1">
                      <Pencil size={14} /> {t('common.edit')}
                    </Button>
                    <Button variant="danger" size="sm" className="!px-3 !py-1.5 flex-1">
                      <Trash2 size={14} /> {t('common.delete')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {search ? t('errors.noResultsFor', { term: search }) : t('errors.noResults')}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
                {t('common.clearSearch')}
              </Button>
            )}
          </Card>
        )}
      </div>

      <AnimatePresence>
        {newUserOpen && <NewUserModal key="new-user" onClose={() => setNewUserOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
