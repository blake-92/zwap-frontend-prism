import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, UserPlus,
  Pencil, Trash2,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, AvatarInfo, Toggle, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar, SegmentControl } from '@/shared/ui'
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
  const [users, setUsers]       = useState(USERS)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [newUserOpen, setNewUserOpen] = useState(false)

  const roles = ['Todos', 'Administrador', 'Contador', 'Recepcionista']

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'Todos' || u.role === roleFilter
    return matchSearch && matchRole
  }), [users, search, roleFilter])

  const toggleUser = id =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))


  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader title="Usuarios" description="Gestión de acceso y permisos del equipo">
        <Button onClick={() => setNewUserOpen(true)}>
          <UserPlus size={18} /> Nuevo Usuario
        </Button>
      </PageHeader>

      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
          />
        }
        actions={<Button variant="successExport" size="sm"><Download size={14} /> Exportar CSV</Button>}
      >
        <SegmentControl
          options={roles.map(r => ({ value: r, label: r }))}
          value={roleFilter}
          onChange={setRoleFilter}
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
                <th className="px-8 py-4 min-w-[240px]">Usuario</th>
                <th className="px-6 py-4 min-w-[130px]">Rol</th>
                <th className="px-6 py-4 min-w-[260px]">Sucursales</th>
                <th className="px-6 py-4 text-center min-w-[100px]">Estado</th>
                <th className="px-8 py-4 text-right min-w-[120px]">Acciones</th>
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
                      {user.role}
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
                      <Tooltip content="Editar usuario" position="top">
                        <Button variant="action" size="sm" className="!px-3 !py-2">
                          <Pencil size={14} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Eliminar usuario" position="top">
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
                      {user.role}
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
                      <Pencil size={14} /> Editar
                    </Button>
                    <Button variant="danger" size="sm" className="!px-3 !py-1.5 flex-1">
                      <Trash2 size={14} /> Eliminar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              No se encontraron usuarios{search ? ` para "${search}"` : ''}.
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
                Limpiar busqueda
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
