import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download, UserPlus,
  Pencil, Trash2,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, Toggle, SearchInput, EmptySearchState } from '@/shared/ui'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'
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

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'Todos' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleUser = id =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))


  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Usuarios
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Gestión de acceso y permisos del equipo
          </p>
        </div>
        <Button onClick={() => setNewUserOpen(true)}>
          <UserPlus size={18} /> Nuevo Usuario
        </Button>
      </div>

      {/* Toolbar */}
      <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex justify-between items-center ${
        isDarkMode
          ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
          : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'
      }`}>
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
          />
          {/* Role filter pills */}
          <div className="flex items-center gap-1.5">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === r
                    ? isDarkMode
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30'
                      : 'bg-[#DBD3FB]/60 text-[#561BAF] border border-[#7C3AED]/20'
                    : isDarkMode
                      ? 'text-[#888991] hover:text-[#D8D7D9]'
                      : 'text-[#67656E] hover:text-[#111113]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Button variant="successExport" size="sm">
          <Download size={14} /> Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <Card className="pb-2">
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                        isDarkMode
                          ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                          : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
                      }`}>
                        {user.initials}
                      </div>
                      <div>
                        <p className={`font-bold text-sm capitalize ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                          {user.name}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
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
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="action" size="sm" className="!px-3 !py-2">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="danger" size="sm" className="!px-3 !py-2">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </Card>

      {newUserOpen && <NewUserModal onClose={() => setNewUserOpen(false)} />}
    </motion.div>
  )
}
