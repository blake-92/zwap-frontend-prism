import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, QrCode, Copy, ExternalLink, Maximize,
  Download, ChevronDown, Edit2, Mail, Eye,
  Timer, ListTree, CalendarDays,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import { Card, Button, Badge, SectionLabel, Toggle, EmptySearchState, Tooltip, PageHeader, TableToolbar, SwipeableCard } from '@/shared/ui'
import { listVariants, itemVariants, cardItemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { PERMANENT_LINKS, CUSTOM_LINKS } from '@/services/mocks/mockData'
import NewLinkModal from './NewLinkModal'
import LinkDetailModal from './LinkDetailModal'

/* ─────────────────────────────────────────────────────────────
   Permanent Link Card (desktop)
───────────────────────────────────────────────────────────── */
function PermanentCard({ link, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    const key = window.innerWidth < 640 ? 'links.linkCopiedShort' : 'links.linkCopied'
    addToast(t(key, { name: link.name }), 'success')
  }

  return (
    <Card className="p-6 relative group">
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

      <div className={`pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex gap-2">
          <Tooltip content={t('links.viewQr')} position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active}>
              <QrCode size={16} />
            </Button>
          </Tooltip>
          <Tooltip content={t('links.copyLink')} position="top">
            <Button variant="ghost" size="icon" className="!p-1.5" disabled={!link.active} onClick={handleCopy}>
              <Copy size={16} />
            </Button>
          </Tooltip>
        </div>
        <Button variant="outline" size="sm" disabled={!link.active} className="!py-1.5 !px-3 !text-xs">
          {t('common.open')} <ExternalLink size={12} />
        </Button>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Quick Link Card — swipeable + glass action column (mobile)
───────────────────────────────────────────────────────────── */
const SPRING_DOTS = { type: 'spring', stiffness: 420, damping: 32 }

function QuickLinkSwipeable({ links, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()
  const { t }          = useTranslation()

  const [index, setIndex] = useState(
    () => Math.max(0, links.findIndex(l => l.active))
  )
  const [isQrOpen, setIsQrOpen] = useState(false)

  const selected = links[index]

  useEffect(() => {
    if (!isQrOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setIsQrOpen(false) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isQrOpen])

  const goNext = () => setIndex(i => (i + 1) % links.length)
  const goPrev = () => setIndex(i => (i - 1 + links.length) % links.length)

  return (
    <>
      <Card className="p-0 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
        <div className="flex items-stretch">

          {/* ── Izquierda: área swipeable — QR + nombre/url + dots ── */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            style={{ touchAction: 'pan-y' }}
            onDragEnd={(_, info) => {
              if (info.velocity.x < -200 || info.offset.x < -50) goNext()
              else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
            }}
            className="flex-1 flex items-center gap-4 px-4 py-4 min-w-0 cursor-grab active:cursor-grabbing select-none"
          >
            {/* QR — tap abre lightbox */}
            <motion.div
              layoutId="ql-qr-mini"
              onClick={() => selected.active && setIsQrOpen(true)}
              className={`relative flex-shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 group ${
                selected.active ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <QrCode
                size={84}
                className={`text-black transition-opacity duration-300 ${
                  selected.active ? 'opacity-100' : 'opacity-10'
                }`}
                strokeWidth={1.5}
              />
              <AnimatePresence>
                {!selected.active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]"
                  >
                    <span className="text-[9px] font-bold text-[#888991] uppercase tracking-wide">
                      {t('links.inactive')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {selected.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04] rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#7C3AED] rounded-full p-1.5 shadow-md">
                    <Maximize size={11} className="text-white" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Nombre + URL + dots */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.13 }}
                >
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                    {selected.name}
                  </p>
                  <p className={`text-[10px] font-mono truncate mt-0.5 ${
                    selected.active
                      ? isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      : isDarkMode ? 'text-[#45434A]' : 'text-[#C5C3CC]'
                  }`}>
                    {selected.url}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Pill dots — la activa se expande */}
              <div className="flex gap-1.5 mt-2.5">
                {links.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === index ? 16 : 6,
                      backgroundColor: i === index
                        ? '#7C3AED'
                        : isDarkMode ? '#45434A' : '#D1D0D6',
                    }}
                    transition={SPRING_DOTS}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Divisor ── */}
          <div className={`w-px my-3 flex-shrink-0 ${isDarkMode ? 'bg-white/8' : 'bg-black/5'}`} />

          {/* ── Derecha: columna de acciones ── */}
          <div className="flex flex-col items-center justify-center gap-2.5 px-3 py-4 flex-shrink-0">
            <button
              disabled={!selected.active}
              onClick={() => {
                if (!selected.active) return
                navigator.clipboard.writeText(`https://${selected.url}`)
                const key = window.innerWidth < 640 ? 'links.linkCopiedShort' : 'links.linkCopied'
                addToast(t(key, { name: selected.name }), 'success')
              }}
              className={`p-2 rounded-xl transition-colors ${
                selected.active
                  ? isDarkMode
                    ? 'text-[#D8D7D9] hover:bg-white/8 active:bg-white/12'
                    : 'text-[#45434A] hover:bg-black/5 active:bg-black/8'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <Copy size={16} />
            </button>

            <div className={`w-5 border-t ${isDarkMode ? 'border-white/8' : 'border-black/6'}`} />

            <button
              disabled={!selected.active}
              onClick={() => {
                if (!selected.active) return
                window.open(`https://${selected.url}`, '_blank')
              }}
              className={`p-2 rounded-xl transition-colors ${
                selected.active
                  ? isDarkMode
                    ? 'text-[#D8D7D9] hover:bg-white/8 active:bg-white/12'
                    : 'text-[#45434A] hover:bg-black/5 active:bg-black/8'
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              <ExternalLink size={16} />
            </button>

            <div className={`w-5 border-t ${isDarkMode ? 'border-white/8' : 'border-black/6'}`} />

            <Toggle
              active={selected.active}
              onToggle={() => onToggle(selected.id)}
            />
          </div>
        </div>
      </Card>

      {/* Lightbox fullscreen */}
      <AnimatePresence>
        {isQrOpen && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsQrOpen(false)}
            />
            <motion.div
              layoutId="ql-qr-mini"
              className="relative bg-white p-8 sm:p-12 rounded-[32px] shadow-2xl flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <QrCode size={260} className="text-black mb-5" strokeWidth={1.5} />
              <p className="text-[#111113] font-bold text-xl mb-1 text-center">{selected.name}</p>
              <p className="text-[#67656E] font-mono text-sm text-center">{selected.url}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Custom Links Table
───────────────────────────────────────────────────────────── */
function CustomLinksTable({ onDetail, onEdit, search, onClearSearch }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()

  const filtered = useMemo(() => CUSTOM_LINKS.filter(l =>
    !search || l.client.toLowerCase().includes(search.toLowerCase())
  ), [search])

  const handleCopy = (link) => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    const key = window.innerWidth < 640 ? 'links.linkCopiedShort' : 'links.linkCopied'
    addToast(t(key, { name: link.client }), 'success')
  }

  return (
    <>
      <TableToolbar
        actions={<Button variant="successExport" size="sm"><Download size={14} /> {t('common.exportCsv')}</Button>}
      >
        <Button variant="outline" size="sm">
          {t('filters.status')} <ChevronDown size={12} />
        </Button>
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table aria-label={t('links.title')} className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40' : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4">{t('transactions.tableClient')}</th>
                <th className="px-6 py-4">{t('settlements.tableDetail')}</th>
                <th className="px-6 py-4">{t('settlements.tableTiming')}</th>
                <th className="px-6 py-4 text-center">{t('filters.status')}</th>
                <th className="px-8 py-4 text-right">{t('transactions.tableActions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {filtered.length === 0 ? (
                <EmptySearchState colSpan={5} term={search} onClear={() => onClearSearch()} />
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
                  {/* Cliente */}
                  <td className="px-8 py-4">
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        {link.client}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        {link.email}
                      </p>
                    </div>
                  </td>

                  {/* Detalle */}
                  <td className="px-6 py-4">
                    <p className={`font-mono font-bold text-[15px] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${link.amount}
                    </p>
                    <p className={`text-[11px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <ListTree size={12} className="opacity-70" /> {link.items} {t('dashboard.items')}
                    </p>
                  </td>

                  {/* Tiempos */}
                  <td className="px-6 py-4">
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${
                      link.status === 'Expirado' ? 'text-rose-500' : isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
                    }`}>
                      <Timer size={14} className="opacity-70" />
                      {link.expires !== '-' ? t('links.expires', { date: link.expires }) : t('links.noExpiration')}
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <CalendarDays size={12} className="opacity-70" /> {t('links.created', { date: link.createdAt })}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge variant={link.statusVariant} icon={link.StatusIcon}>
                        {link.status}
                      </Badge>
                      <p className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <Eye size={10} /> {link.views} {t('links.views')}
                      </p>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content={t('common.edit')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Pagado'} onClick={() => onEdit(link)}>
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('links.copyLink')} position="top">
                        <Button
                          variant="ghost" size="sm" className="!px-2"
                          disabled={link.status === 'Expirado'}
                          onClick={() => handleCopy(link)}
                        >
                          <Copy size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('links.generateQr')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2" disabled={link.status === 'Expirado'}>
                          <QrCode size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('users.sendByEmail')} position="top">
                        <Button
                          variant="action" size="sm" className="!px-3 ml-1"
                          disabled={link.status === 'Expirado' || link.status === 'Pagado'}
                        >
                          <Mail size={15} />
                          <span className="hidden xl:inline text-xs ml-1">{t('links.send')}</span>
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

      {/* Cards (mobile / tablet) — SwipeableCard with swipe-to-edit */}
      <div className="lg:hidden">
        {filtered.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((link) => (
              <motion.div key={link.id} variants={cardItemVariants}>
                <SwipeableCard
                  actions={[
                    {
                      label: t('common.edit'),
                      icon: Edit2,
                      disabled: link.status === 'Pagado',
                      onClick: () => onEdit(link),
                    },
                  ]}
                >
                  {/* Tappable area → opens detail modal */}
                  <div className="p-4" onClick={() => onDetail(link)}>
                    {/* Row 1: Client name + Amount */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <p className={`text-sm font-bold truncate min-w-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        {link.client}
                      </p>
                      <span className={`font-mono font-bold text-lg tracking-tight flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        ${link.amount}
                      </span>
                    </div>

                    {/* Row 2: Status + items/views + expiry */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <Badge variant={link.statusVariant} icon={link.StatusIcon} />
                        <span className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <ListTree size={10} /> {link.items}
                        </span>
                        <span className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <Eye size={10} /> {link.views}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${
                        link.status === 'Expirado' ? 'text-rose-500' : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      }`}>
                        <Timer size={11} />
                        {link.expires !== '-' ? link.expires : t('links.noExpiration')}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Action buttons — outside tap area to prevent detail modal */}
                  <div className={`flex items-center gap-1.5 px-4 pb-4 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado' || link.status === 'Pagado'}
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <Mail size={16} />
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado'}
                      onClick={(e) => { e.stopPropagation(); handleCopy(link) }}
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="!p-2.5 flex-1 justify-center"
                      disabled={link.status === 'Expirado'}
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <QrCode size={16} />
                    </Button>
                  </div>
                </SwipeableCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {search ? t('links.notFoundFor', { term: search }) : t('links.notFound')}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => onClearSearch()} className="mt-2">
                {t('common.clearSearch')}
              </Button>
            )}
          </Card>
        )}
      </div>
    </>
  )
}


/* ─────────────────────────────────────────────────────────────
   LinksView
───────────────────────────────────────────────────────────── */
export default function LinksView() {
  const { t } = useTranslation()
  const [links, setLinks]         = useState(PERMANENT_LINKS)
  const [newLinkOpen, setNewLinkOpen] = useState(false)
  const [detailLink, setDetailLink]   = useState(null)
  const [editLink, setEditLink]       = useState(null)
  const { query: search, setQuery: setSearch } = useViewSearch(t('links.searchPlaceholder'))

  const toggleLink = id =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l))

  const handleEdit = (link) => {
    setDetailLink(null)
    setEditLink(link)
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      <PageHeader title={t('links.title')}>
        <div className="hidden lg:block">
          <Button onClick={() => setNewLinkOpen(true)}>
            <Plus size={18} /> {t('links.createLink')}
          </Button>
        </div>
      </PageHeader>

      {/* Permanentes — desktop: grid cards */}
      <div className="hidden lg:block">
        <SectionLabel className="uppercase mb-4">{t('links.permanentSection')}</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
          {links.map(link => (
            <PermanentCard key={link.id} link={link} onToggle={() => toggleLink(link.id)} />
          ))}
        </div>
      </div>

      {/* Mobile only: Full-width new link button */}
      <div className="lg:hidden mb-6">
        <Button size="lg" className="w-full" onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> {t('links.createLink')}
        </Button>
      </div>

      {/* Mobile: compact quick-charge card */}
      <div className="lg:hidden mb-6">
        <SectionLabel className="uppercase mb-3">{t('links.quickLinks')}</SectionLabel>
        <QuickLinkSwipeable links={links} onToggle={toggleLink} />
      </div>

      {/* Personalizados */}
      <SectionLabel className="uppercase mb-4">{t('links.customSection')}</SectionLabel>
      <CustomLinksTable onDetail={setDetailLink} onEdit={handleEdit} search={search} onClearSearch={() => setSearch('')} />

      {/* Modals */}
      <AnimatePresence>
        {newLinkOpen && <NewLinkModal key="new-link" onClose={() => setNewLinkOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editLink && <NewLinkModal key="edit-link" link={editLink} onClose={() => setEditLink(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {detailLink && (
          <LinkDetailModal
            key="link-detail"
            link={detailLink}
            onClose={() => setDetailLink(null)}
            onEdit={handleEdit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
