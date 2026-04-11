import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, QrCode, Copy, ExternalLink,
  Download, ChevronDown, Edit2, Mail, Eye,
  Timer, ListTree,
  CalendarDays,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Badge, AvatarInfo, SectionLabel, Toggle, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { PERMANENT_LINKS, CUSTOM_LINKS } from '@/services/mocks/mockData'
import NewLinkModal from './NewLinkModal'

/* ─────────────────────────────────────────────────────────────
   Permanent Link Card
───────────────────────────────────────────────────────────── */
function PermanentCard({ link, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    addToast(`Enlace "${link.name}" copiado al portapapeles.`, 'success')
  }

  return (
    <Card className="p-6 relative group">
      {/* Icon + Toggle */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          link.active
            ? isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
            : isDarkMode ? 'bg-[#252429] text-[#888991]'    : 'bg-gray-100 text-[#67656E]'
        }`}>
          <QrCode size={22} />
        </div>
        <Toggle active={link.active} onToggle={onToggle} />
      </div>

      {/* Info */}
      <h4 className={`text-lg font-bold tracking-tight mb-1 ${
        link.active
          ? isDarkMode ? 'text-white' : 'text-[#111113]'
          : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
      }`}>
        {link.name}
      </h4>
      <p className={`text-xs font-medium mb-6 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
        {link.desc}
      </p>

      {/* Actions */}
      <div className={`pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex gap-2">
          <Tooltip content="Ver código QR" position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active}>
              <QrCode size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Copiar enlace" position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active} onClick={handleCopy}>
              <Copy size={16} />
            </Button>
          </Tooltip>
        </div>
        <Button variant="outline" size="sm" disabled={!link.active} className="!py-1.5 !px-3 !text-xs">
          Abrir <ExternalLink size={12} />
        </Button>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Custom Links Table
───────────────────────────────────────────────────────────── */
function CustomLinksTable() {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => CUSTOM_LINKS.filter(l =>
    !search || l.client.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase())
  ), [search])

  return (
    <>
      <TableToolbar actions={<Button variant="successExport" size="sm"><Download size={14} /> Exportar CSV</Button>}>
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente o ID..."
        />
        <Button variant="outline" size="sm">
          Estado <ChevronDown size={12} />
        </Button>
      </TableToolbar>

      {/* Table */}
      <Card className="pb-2">
        <div className="overflow-x-auto">
          <table aria-label="Links de pago personalizados" className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40' : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-6 py-4">ID & Cliente</th>
                <th className="px-6 py-4">Detalle / Items</th>
                <th className="px-6 py-4">Tiempos</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {filtered.length === 0 ? (
                <EmptySearchState colSpan={5} term={search} onClear={() => setSearch('')} />
              ) : filtered.map((link) => (
                <motion.tr
                  variants={itemVariants}
                  key={link.id}
                  className={`group transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                      : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                  }`}
                >
                  {/* ID & Cliente */}
                  <td className="px-6 py-4">
                    <AvatarInfo
                      initials={link.initials}
                      primary={link.client}
                      secondary={link.email}
                      meta={link.id}
                    />
                  </td>

                  {/* Detalle */}
                  <td className="px-6 py-4">
                    <p className={`font-mono font-bold text-[15px] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${link.amount}
                    </p>
                    <p className={`text-[11px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <ListTree size={12} className="opacity-70" /> {link.items} Items
                    </p>
                  </td>

                  {/* Tiempos */}
                  <td className="px-6 py-4">
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${
                      link.status === 'Expirado' ? 'text-rose-500' : isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
                    }`}>
                      <Timer size={14} className="opacity-70" />
                      {link.expires !== '-' ? `Expira: ${link.expires}` : 'Sin expiración'}
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <CalendarDays size={12} className="opacity-70" /> Creado: {link.createdAt}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge variant={link.statusVariant} icon={link.StatusIcon}>
                        {link.status}
                      </Badge>
                      <p className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <Eye size={10} /> {link.views} vistas
                      </p>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Editar" position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Pagado'}>
                          <Edit2 size={15} />
                          <span className="hidden xl:inline text-xs ml-1">Editar</span>
                        </Button>
                      </Tooltip>
                      <Tooltip content="Copiar enlace" position="top">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="!px-2" 
                          disabled={link.status === 'Expirado'}
                          onClick={() => {
                            navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
                            addToast(`Enlace "${link.id}" copiado al portapapeles.`, 'success')
                          }}
                        >
                          <Copy size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Generar QR" position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Expirado'}>
                          <QrCode size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Enviar por Mail" position="top">
                        <Button
                          variant="action" size="sm" className="!px-3 ml-1"
                          disabled={link.status === 'Expirado' || link.status === 'Pagado'}
                        >
                          <Mail size={15} />
                          <span className="hidden xl:inline text-xs ml-1">Enviar</span>
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
    </>
  )
}


/* ─────────────────────────────────────────────────────────────
   LinksView
───────────────────────────────────────────────────────────── */
export default function LinksView() {
  const [links, setLinks]         = useState(PERMANENT_LINKS)
  const [newLinkOpen, setNewLinkOpen] = useState(false)

  const toggleLink = id =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l))

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      <PageHeader title="Links de Pago" description="Gestiona cobros rápidos en mostrador y reservas personalizadas.">
        <Button onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> Nuevo Link de Reserva
        </Button>
      </PageHeader>

      {/* Permanentes */}
      <SectionLabel className="uppercase mb-4">Enlaces Permanentes (Monto Abierto)</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {links.map(link => (
          <PermanentCard key={link.id} link={link} onToggle={() => toggleLink(link.id)} />
        ))}
      </div>

      {/* Personalizados */}
      <SectionLabel className="uppercase mb-4">Enlaces de Reserva (Personalizados)</SectionLabel>
      <CustomLinksTable />

      <AnimatePresence>
        {newLinkOpen && <NewLinkModal key="new-link" onClose={() => setNewLinkOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
