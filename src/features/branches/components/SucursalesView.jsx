import { useState } from 'react'
import {
  Building2, MapPin, Users, Pencil, Trash2,
  PlusCircle, Star,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge } from '@/shared/ui'
import { BRANCH_LIST } from '@/services/mocks/mockData'
import NewBranchModal from './NewBranchModal'

/* ─── Branch Card ─────────────────────────────────────────── */
function BranchCard({ branch }) {
  const { isDarkMode } = useTheme()

  return (
    <Card hoverEffect className="p-6 cursor-pointer group relative overflow-hidden">
      {/* Top row: icon + action buttons */}
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#7C3AED]/15 text-[#7C3AED] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
            : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-sm'
        }`}>
          <Building2 size={22} />
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="action" size="sm" className="!px-2.5 !py-2">
            <Pencil size={13} />
          </Button>
          {!branch.isMain && (
            <Button variant="danger" size="sm" className="!px-2.5 !py-2">
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Name + main badge */}
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {branch.name}
        </h3>
        {branch.isMain && (
          <Badge variant="default">
            <Star size={9} className="inline mr-0.5" />Principal
          </Badge>
        )}
      </div>

      {/* Address */}
      <p className={`text-xs font-medium flex items-center gap-1.5 mb-5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
        <MapPin size={12} className="opacity-70 flex-shrink-0" />
        {branch.address}
      </p>

      {/* Footer: user count */}
      <div className={`pt-4 border-t flex items-center gap-2 ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <Users size={14} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'} />
        <span className={`text-xs font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          {branch.users} {branch.users === 1 ? 'usuario' : 'usuarios'} asignados
        </span>
      </div>
    </Card>
  )
}

/* ─── Add card ────────────────────────────────────────────── */
function AddBranchCard({ onClick }) {
  const { isDarkMode } = useTheme()
  return (
    <button
      onClick={onClick}
      className={`rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[200px] transition-all duration-300 group ${
        isDarkMode
          ? 'border-white/10 text-[#888991] hover:border-[#7C3AED]/40 hover:text-[#A78BFA] hover:bg-[#7C3AED]/5'
          : 'border-gray-200 text-[#B0AFB4] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#DBD3FB]/10'
      }`}
    >
      <PlusCircle size={28} className="transition-transform duration-300 group-hover:scale-110" />
      <span className="text-sm font-bold">Nueva Sucursal</span>
    </button>
  )
}

/* ─── SucursalesView ──────────────────────────────────────── */
export default function SucursalesView() {
  const { isDarkMode }                = useTheme()
  const [newBranchOpen, setNewBranchOpen] = useState(false)

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Sucursales
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Gestión de propiedades y puntos de venta
          </p>
        </div>
        <Button onClick={() => setNewBranchOpen(true)}>
          <PlusCircle size={18} /> Nueva Sucursal
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {BRANCH_LIST.map(b => (
          <BranchCard key={b.id} branch={b} />
        ))}
        <AddBranchCard onClick={() => setNewBranchOpen(true)} />
      </div>

      {newBranchOpen && <NewBranchModal onClose={() => setNewBranchOpen(false)} />}
    </div>
  )
}
