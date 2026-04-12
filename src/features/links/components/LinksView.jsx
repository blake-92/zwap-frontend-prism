import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, QrCode, Copy, ExternalLink,
  Download, ChevronDown, Edit2, Mail, Eye,
  Timer, ListTree,
  CalendarDays,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Badge, SectionLabel, Toggle, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar, SwipeableCard } from '@/shared/ui'
import { listVariants, itemVariants, cardItemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { PERMANENT_LINKS, CUSTOM_LINKS } from '@/services/mocks/mockData'
import NewLinkModal from './NewLinkModal'
import LinkDetailModal from './LinkDetailModal'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

/* ─────────────────────────────────────────────────────────────
   Permanent Link Card (desktop)
───────────────────────────────────────────────────────────── */
function PermanentCard({ link, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    addToast(t('links.linkCopied', { name: link.name }), 'success')
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
   Permanent Links — compact mobile accordion
───────────────────────────────────────────────────────────── */
function PermanentLinksMobile({ links, onToggle }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
          isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/50 text-[#561BAF]'
          }`}>
            <QrCode size={15} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              {t('links.quickLinks')}
            </p>
            <p className={`text-[10px] font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {links.filter(l => l.active).length}/{links.length} {t('links.activeCount')}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={SPRING}
          className={isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: SPRING, opacity: { duration: 0.15 } }}
            className="overflow-hidden"
          >
            <div className={`border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              {links.map((link, idx) => (
                <div
                  key={link.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx < links.length - 1
                      ? isDarkMode ? 'border-b border-white/5' : 'border-b border-black/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      link.active ? 'bg-emerald-500' : isDarkMode ? 'bg-[#45434A]' : 'bg-gray-300'
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${
                        link.active
                          ? isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
                          : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                      }`}>
                        {link.name}
                      </p>
                      <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        {link.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Button
                      variant="ghost" size="sm" className="!p-1.5"
                      disabled={!link.active}
                      onClick={() => {
                        navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
                        addToast(t('links.linkCopied', { name: link.name }), 'success')
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Toggle active={link.active} onToggle={() => onToggle(link.id)} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────────
   Custom Links Table
───────────────────────────────────────────────────────────── */
function CustomLinksTable({ onDetail, onEdit }) {
  const { isDarkMode } = useTheme()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => CUSTOM_LINKS.filter(l =>
    !search || l.client.toLowerCase().includes(search.toLowerCase())
  ), [search])

  const handleCopy = (link) => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    addToast(t('links.linkCopied', { name: link.client }), 'success')
  }

  return (
    <>
      <TableToolbar
        search={
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('links.searchPlaceholder')}
          />
        }
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
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
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
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [links, setLinks]         = useState(PERMANENT_LINKS)
  const [newLinkOpen, setNewLinkOpen] = useState(false)
  const [detailLink, setDetailLink]   = useState(null)
  const [editLink, setEditLink]       = useState(null)

  const toggleLink = id =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l))

  const handleEdit = (link) => {
    setDetailLink(null)
    setEditLink(link)
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">
      <PageHeader title={t('links.title')} description={t('links.description')}>
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

      {/* Mobile: accordion + CTA button */}
      <div className="lg:hidden space-y-3 mb-6">
        <PermanentLinksMobile links={links} onToggle={toggleLink} />
        <Button size="lg" className="w-full" onClick={() => setNewLinkOpen(true)}>
          <Plus size={18} /> {t('dashboard.newReservationLink')}
        </Button>
      </div>

      {/* Personalizados */}
      <SectionLabel className="uppercase mb-4">{t('links.customSection')}</SectionLabel>
      <CustomLinksTable onDetail={setDetailLink} onEdit={handleEdit} />

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
